'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createContribution(data: {
  week: string;
  imageUrl: string;
  amount?: number;
}) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if contribution for this week already exists
    const existingContribution = await prisma.contribution.findFirst({
      where: {
        memberId: dbUser.id,
        week: data.week,
      },
    });

    if (existingContribution) {
      return { success: false, error: 'Bạn đã nộp quỹ tuần này rồi' };
    }

    // Create new contribution
    const contribution = await prisma.contribution.create({
      data: {
        week: data.week,
        imageUrl: data.imageUrl,
        amount: data.amount || 20000,
        status: 'PENDING',
        memberId: dbUser.id,
      },
    });

    // Revalidate dashboard page
    revalidatePath('/dashboard');

    return { success: true, contribution };
  } catch (error) {
    console.error('Create contribution error:', error);
    return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' };
  }
}
