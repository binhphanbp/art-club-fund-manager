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
  const weeklyTrends: { week: string; amount: number; shortWeek: string }[] =
    [];
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

  // 5. Fetch data for Payment Matrix
  // Get all members (MEMBER role only)
  const allMembers = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    orderBy: [{ department: 'asc' }, { fullName: 'asc' }],
    select: {
      id: true,
      fullName: true,
      email: true,
      department: true,
    },
  });

  // Get all contributions for the matrix (last 12 weeks)
  const matrixWeeks: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekNum = currentWeek - i;
    const actualWeekNum = weekNum > 0 ? weekNum : 52 + weekNum;
    matrixWeeks.push(`Tuần ${actualWeekNum}`);
  }

  const allContributions = await prisma.contribution.findMany({
    where: {
      week: { in: matrixWeeks },
    },
    select: {
      id: true,
      memberId: true,
      week: true,
      status: true,
      imageUrl: true,
      amount: true,
    },
  });

  // Build matrix data structure
  const matrixData = {
    weeks: matrixWeeks,
    members: allMembers,
    contributions: allContributions,
    currentWeek: currentWeekString,
  };

  // 6. Analytics Data
  // Get current month start and end
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Monthly Revenue (approved this month)
  const monthlyApproved = await prisma.contribution.aggregate({
    where: {
      status: 'APPROVED',
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    _sum: { amount: true },
  });
  const monthlyRevenue = monthlyApproved._sum.amount || 0;

  // Debtors count (members who haven't paid this week)
  const paidMemberIds = new Set(membersWhoPaidThisWeek.map((m) => m.memberId));
  const debtorsCount = totalMembers - paidMemberIds.size;

  // 8-week trends for analytics
  const analyticsWeeklyTrends: { week: string; amount: number; shortWeek: string }[] = [];
  for (let i = 7; i >= 0; i--) {
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

    analyticsWeeklyTrends.push({
      week: weekString,
      shortWeek: `T${actualWeekNum}`,
      amount: weeklyTotal._sum.amount || 0,
    });
  }

  // Department breakdown
  const departmentStats: { department: string; approved: number; pending: number; total: number; memberCount: number }[] = [];
  const departments = ['SINGING', 'DANCE', 'RAP', 'INSTRUMENT'] as const;

  for (const dept of departments) {
    const deptApproved = await prisma.contribution.aggregate({
      where: {
        status: 'APPROVED',
        member: { department: dept },
      },
      _sum: { amount: true },
    });

    const deptPending = await prisma.contribution.count({
      where: {
        status: 'PENDING',
        member: { department: dept },
      },
    });

    const deptMemberCount = await prisma.user.count({
      where: { department: dept, role: 'MEMBER' },
    });

    departmentStats.push({
      department: dept,
      approved: deptApproved._sum.amount || 0,
      pending: deptPending,
      total: (deptApproved._sum.amount || 0),
      memberCount: deptMemberCount,
    });
  }

  // Check if current month is closed
  const currentMonthClose = await prisma.monthlyClose.findUnique({
    where: {
      month_year: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
  });

  const analyticsData = {
    totalBalance: totalApprovedFunds,
    monthlyRevenue,
    debtorsCount,
    weeklyTrends: analyticsWeeklyTrends,
    departmentStats,
    currentMonth: now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    isMonthClosed: !!currentMonthClose,
    closedAt: currentMonthClose?.closedAt,
  };

  // Fetch pending member applications
  const pendingApplications = await prisma.user.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      department: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <AdminClient
      initialContributions={pendingContributions}
      statistics={statistics}
      matrixData={matrixData}
      analyticsData={analyticsData}
      userRole={dbUser.role}
      pendingApplications={pendingApplications}
    />
  );
}
