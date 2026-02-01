'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Check if user is admin
async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

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
export async function rejectContribution(contributionId: string, reason: string) {
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
