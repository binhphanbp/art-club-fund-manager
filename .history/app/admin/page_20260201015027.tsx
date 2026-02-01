import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import AdminClient from './admin-client';

export const metadata = {
  title: 'Quản lý đóng góp - Art Club',
  description: 'Duyệt đóng góp của thành viên',
};

// Helper: Get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get user from database to check role
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  // Get all pending contributions
  const pendingContributions = await prisma.contribution.findMany({
    where: { status: 'PENDING' },
    include: {
      member: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Calculate statistics
  const currentWeek = getCurrentWeekNumber();
  const currentWeekString = `Tuần ${currentWeek}`;

  // 1. Total Approved Funds
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

  // 3. Member Completion Rate for current week
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

  // 4. Weekly collection trends (last 4 weeks)
  const weeklyTrends: { week: string; amount: number; shortWeek: string }[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekNum = currentWeek - i;
    const actualWeekNum = weekNum > 0 ? weekNum : 52 + weekNum;
    const weekString = `Tuần ${actualWeekNum}`;

    const weeklyTotal = await prisma.contribution.aggregate({
      where: {
        week: weekString,
        status: 'APPROVED',
      },
      _sum: { amount: true },
    });

    weeklyTrends.push({
      week: weekString,
      shortWeek: `T${actualWeekNum}`,
      amount: weeklyTotal._sum.amount || 0,
    });
  }

  const statistics = {
    totalApprovedFunds,
    pendingThisWeek,
    totalPending: pendingContributions.length,
    completionRate,
    totalMembers,
    paidMembers: membersWhoPaidThisWeek.length,
    currentWeek: currentWeekString,
    weeklyTrends,
  };

  return (
    <AdminClient
      initialContributions={pendingContributions}
      statistics={statistics}
    />
  );
}
