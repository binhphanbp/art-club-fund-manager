import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get user data from our database with ALL contributions
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      contributions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  return <DashboardClient user={dbUser} authUser={user} />;
}
