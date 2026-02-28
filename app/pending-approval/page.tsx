import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PendingApprovalClient from './pending-approval-client';

export const metadata = {
  title: 'Chờ duyệt - Art Club',
};

export default async function PendingApprovalPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // If user is ACTIVE, they should be in dashboard
  if (dbUser.status === 'ACTIVE') {
    redirect('/dashboard');
  }

  return (
    <PendingApprovalClient
      fullName={dbUser.fullName}
      email={dbUser.email}
      department={dbUser.department}
      status={dbUser.status}
    />
  );
}
