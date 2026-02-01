'use server';

import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { createClient } from '@/lib/supabase/server';
import ReminderEmail from '@/emails/reminder-email';
import { Department } from '@prisma/client';

// Department display names
const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

// Get current week of year
function getCurrentWeek(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Check if user is admin
async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, error: 'Chưa đăng nhập' };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Không có quyền truy cập' };
  }

  return { success: true, user: dbUser };
}

// Get all users who haven't submitted for current week
export async function getUnpaidMembers() {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error, members: [] };
    }

    const currentWeek = getCurrentWeek();
    const weekString = `W${currentWeek}`;

    // Get all users
    const allUsers = await prisma.user.findMany({
      include: {
        contributions: {
          where: { week: weekString },
        },
      },
    });

    // Filter users who haven't submitted for current week
    const unpaidMembers = allUsers.filter(
      (user) => user.contributions.length === 0
    );

    return {
      success: true,
      members: unpaidMembers,
      currentWeek,
      totalMembers: allUsers.length,
      unpaidCount: unpaidMembers.length,
    };
  } catch (error: any) {
    console.error('Get unpaid members error:', error);
    return { success: false, error: error.message, members: [] };
  }
}

// Send reminder email to a single member
export async function sendReminderEmail(userId: string) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const currentWeek = getCurrentWeek();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const { data, error } = await resend.emails.send({
      from: 'CLB Nghệ Thuật <noreply@artclub.example.com>',
      to: user.email,
      subject: `🎭 Nhắc nhở nộp quỹ tuần ${currentWeek} - CLB Nghệ Thuật`,
      react: ReminderEmail({
        memberName: user.fullName,
        currentWeek,
        departmentName: departmentNames[user.department],
      }),
    });

    if (error) {
      console.error('Send email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error('Send reminder email error:', error);
    return { success: false, error: error.message };
  }
}

// Send reminder emails to all unpaid members (Nuclear Option)
export async function sendBulkReminderEmails() {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error, results: [] };
    }

    if (!resend) {
      return { success: false, error: 'Email service not configured. Please add RESEND_API_KEY to .env', results: [] };
    }

    const currentWeek = getCurrentWeek();
    const weekString = `W${currentWeek}`;

    // Get all users who haven't submitted for current week
    const allUsers = await prisma.user.findMany({
      include: {
        contributions: {
          where: { week: weekString },
        },
      },
    });

    const unpaidMembers = allUsers.filter(
      (user) => user.contributions.length === 0
    );

    if (unpaidMembers.length === 0) {
      return {
        success: true,
        message: 'Tất cả thành viên đã nộp quỹ tuần này! 🎉',
        results: [],
        totalSent: 0,
      };
    }

    // Send emails to all unpaid members
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const member of unpaidMembers) {
      try {
        const { error } = await resend.emails.send({
          from: 'CLB Nghệ Thuật <noreply@artclub.example.com>',
          to: member.email,
          subject: `🎭 Nhắc nhở nộp quỹ tuần ${currentWeek} - CLB Nghệ Thuật`,
          react: ReminderEmail({
            memberName: member.fullName,
            currentWeek,
            departmentName: departmentNames[member.department],
          }),
        });

        if (error) {
          results.push({ email: member.email, success: false, error: error.message });
        } else {
          results.push({ email: member.email, success: true });
        }
      } catch (err: any) {
        results.push({ email: member.email, success: false, error: err.message });
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      message: `Đã gửi ${successCount}/${unpaidMembers.length} email thành công!`,
      results,
      totalSent: successCount,
      totalFailed: failCount,
    };
  } catch (error: any) {
    console.error('Send bulk reminder emails error:', error);
    return { success: false, error: error.message, results: [] };
  }
}
