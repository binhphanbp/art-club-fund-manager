'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import WelcomeEmail from '@/emails/welcome-email';
import React from 'react';

const departmentNames: Record<string, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

// Check if user is admin
async function checkAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, error: 'Chưa đăng nhập' };
  }

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Không có quyền truy cập' };
  }

  return { success: true, user: dbUser };
}

// Approve contribution
export async function approveContribution(contributionId: string) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    // Update contribution status
    const contribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: { status: 'APPROVED' },
      include: {
        member: true,
      },
    });

    // TODO: Send confirmation email via Resend (optional)
    // await sendApprovalEmail(contribution.member.email, contribution.week);

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Đã duyệt đóng góp ${contribution.week} của ${contribution.member.fullName}`,
    };
  } catch (error: any) {
    console.error('Approve error:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra' };
  }
}

// Reject contribution
export async function rejectContribution(
  contributionId: string,
  reason: string,
) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Vui lòng nhập lý do từ chối' };
    }

    // Update contribution status
    const contribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: { status: 'REJECTED' },
      include: {
        member: true,
      },
    });

    // TODO: Send rejection email via Resend with reason (optional)
    // await sendRejectionEmail(contribution.member.email, contribution.week, reason);

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Đã từ chối đóng góp ${contribution.week} của ${contribution.member.fullName}`,
    };
  } catch (error: any) {
    console.error('Reject error:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra' };
  }
}

// Get all pending contributions
export async function getPendingContributions() {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error, contributions: [] };
    }

    const contributions = await prisma.contribution.findMany({
      where: { status: 'PENDING' },
      include: {
        member: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, contributions };
  } catch (error: any) {
    console.error('Get pending error:', error);
    return { success: false, error: error.message, contributions: [] };
  }
}

// Helper: Get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Get admin dashboard statistics
export async function getAdminStatistics() {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    const currentWeekString = `Tuần ${currentWeek}`;

    // 1. Total Approved Funds (all time)
    const approvedFunds = await prisma.contribution.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true },
    });
    const totalApprovedFunds = approvedFunds._sum.amount || 0;

    // 2. Pending This Week
    const pendingThisWeek = await prisma.contribution.count({
      where: {
        status: 'PENDING',
        week: currentWeekString,
      },
    });

    // 3. Total Pending (all weeks)
    const totalPending = await prisma.contribution.count({
      where: { status: 'PENDING' },
    });

    // 4. Member Completion Rate for current week
    const totalMembers = await prisma.user.count({
      where: { role: 'MEMBER' },
    });

    const membersWhoPaidThisWeek = await prisma.contribution.findMany({
      where: {
        week: currentWeekString,
        status: { in: ['APPROVED', 'PENDING'] },
      },
      select: { memberId: true },
      distinct: ['memberId'],
    });

    const completionRate =
      totalMembers > 0
        ? Math.round((membersWhoPaidThisWeek.length / totalMembers) * 100)
        : 0;

    // 5. Weekly collection trends (last 4 weeks)
    const weeklyTrends: { week: string; amount: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekNum = currentWeek - i;
      const weekString = `Tuần ${weekNum > 0 ? weekNum : 52 + weekNum}`;

      const weeklyTotal = await prisma.contribution.aggregate({
        where: {
          week: weekString,
          status: 'APPROVED',
        },
        _sum: { amount: true },
      });

      weeklyTrends.push({
        week: weekString,
        amount: weeklyTotal._sum.amount || 0,
      });
    }

    return {
      success: true,
      stats: {
        totalApprovedFunds,
        pendingThisWeek,
        totalPending,
        completionRate,
        totalMembers,
        paidMembers: membersWhoPaidThisWeek.length,
        currentWeek: currentWeekString,
        weeklyTrends,
      },
    };
  } catch (error: any) {
    console.error('Get statistics error:', error);
    return { success: false, error: error.message };
  }
}

// Approve a new member application
export async function approveNewMember(userId: string) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    // Update in DB
    const member = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' } as any,
    });

    // Sync to Supabase auth metadata using service role
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Find the Supabase auth user by email
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === member.email);

    if (authUser) {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        user_metadata: {
          ...authUser.user_metadata,
          status: 'ACTIVE',
        },
      });
    }

    // Send welcome email
    if (resend) {
      const deptName = departmentNames[member.department ?? ''] ?? member.department ?? '';
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`;

      await resend.emails.send({
        from: 'CLB Nghệ Thuật <onboarding@resend.dev>',
        to: member.email,
        subject: `🎉 Chào mừng ${member.fullName} đến với CLB Nghệ Thuật!`,
        react: React.createElement(WelcomeEmail, {
          memberName: member.fullName,
          departmentName: deptName,
          dashboardUrl,
        }),
      });
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: `Đã duyệt thành viên ${member.fullName}. Email chào mừng đã được gửi.`,
    };
  } catch (error: any) {
    console.error('Approve member error:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra' };
  }
}

// Reject a new member application
export async function rejectNewMember(userId: string) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    // Update in DB
    const member = await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' } as any,
    });

    // Sync to Supabase auth metadata using service role
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === member.email);

    if (authUser) {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        user_metadata: {
          ...authUser.user_metadata,
          status: 'REJECTED',
        },
      });
    }

    revalidatePath('/admin');

    return {
      success: true,
      message: `Đã từ chối đơn của ${member.fullName}.`,
    };
  } catch (error: any) {
    console.error('Reject member error:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra' };
  }
}
