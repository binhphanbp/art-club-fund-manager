import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import AdminClient from './admin-client';

export const metadata = {
  title: 'Quản lý đóng góp - Art Club',
  description: 'Duyệt đóng góp của thành viên',
};

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

  return <AdminClient initialContributions={pendingContributions} />;
}
