import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import SuperAdminClient from './super-admin-client';

export const metadata = {
  title: 'Super Admin - Art Club',
  description: 'Quản lý thành viên và cài đặt CLB',
};

export default async function SuperAdminPage() {
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

  // Only SUPER_ADMIN can access this page
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Get all members
  const members = await prisma.user.findMany({
    include: {
      _count: {
        select: { contributions: true },
      },
    },
    orderBy: [
      { role: 'asc' },
      { fullName: 'asc' },
    ],
  });

  // Get or create settings
  let settings = await prisma.settings.findUnique({
    where: { id: 'club-settings' },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'club-settings' },
    });
  }

  return <SuperAdminClient initialMembers={members} initialSettings={settings} />;
}
