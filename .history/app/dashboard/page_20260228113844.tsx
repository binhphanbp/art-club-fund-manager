import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';

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
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      contributions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // If user doesn't exist in our DB, create them
  if (!dbUser) {
    try {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          role: 'MEMBER',
          department: 'SINGING',
        },
      });
      
      // Fetch the newly created user
      dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          contributions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      redirect('/login');
    }
  }

  if (!dbUser) {
    redirect('/login');
  }

  // Block PENDING or REJECTED users from accessing the dashboard
  if (dbUser.status === 'PENDING' || dbUser.status === 'REJECTED') {
    redirect('/pending-approval');
  }

  return <DashboardClient user={dbUser} />;
}
