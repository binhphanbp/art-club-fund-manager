import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import ProfileClient from './profile-client';

export const metadata = {
  title: 'Hồ sơ cá nhân - Art Club',
  description: 'Cập nhật thông tin cá nhân của bạn',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      contributions: {
        where: { status: 'APPROVED' },
        select: { amount: true },
      },
    },
  });

  if (!dbUser) redirect('/login');
  if ((dbUser as any).status === 'PENDING' || (dbUser as any).status === 'REJECTED') {
    redirect('/pending-approval');
  }

  const totalContributions = dbUser.contributions.length;
  const totalAmount = dbUser.contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <ProfileClient
      user={{
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
        department: dbUser.department,
        avatarUrl: (dbUser as any).avatarUrl ?? null,
        bio: (dbUser as any).bio ?? null,
        createdAt: dbUser.createdAt,
      }}
      stats={{ totalContributions, totalAmount }}
    />
  );
}
