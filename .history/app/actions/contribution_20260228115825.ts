'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const WEEKLY_AMOUNT = 20000;

// Helper: get current week number of year
function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export async function createContribution(data: {
  week: string;
  imageUrl: string;
  amount?: number;
  weeksCount?: number; // Number of weeks to pay for (1-4, excess payment)
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    const weeksCount = Math.max(1, Math.min(data.weeksCount ?? 1, 4));
    const currentWeek = getCurrentWeekNumber();

    if (weeksCount === 1) {
      // Single-week logic (existing behaviour)
      const existing = await prisma.contribution.findFirst({
        where: { memberId: dbUser.id, week: data.week },
      });
      if (existing) {
        return { success: false, error: 'Bạn đã nộp quỹ tuần này rồi' };
      }

      const contribution = await prisma.contribution.create({
        data: {
          week: data.week,
          imageUrl: data.imageUrl,
          amount: data.amount ?? WEEKLY_AMOUNT,
          status: 'PENDING',
          memberId: dbUser.id,
        },
      });

      revalidatePath('/dashboard');
      return { success: true, contribution, weeksCreated: 1 };
    }

    // Multi-week: find the earliest N consecutive unpaid weeks up to currentWeek
    // Collect all already-submitted weeks for this member
    const existingContributions = await prisma.contribution.findMany({
      where: { memberId: dbUser.id },
      select: { week: true },
    });
    const submittedWeeks = new Set(existingContributions.map((c) => c.week));

    // Find unpaid weeks going backwards from currentWeek
    const weeksToCreate: string[] = [];
    for (let w = currentWeek; w >= 1 && weeksToCreate.length < weeksCount; w--) {
      const weekStr = `Tuần ${w}`;
      if (!submittedWeeks.has(weekStr)) {
        weeksToCreate.push(weekStr);
      }
    }

    if (weeksToCreate.length === 0) {
      return { success: false, error: 'Không có tuần nào chưa nộp để tách thanh toán' };
    }

    // Sort ascending so Tuần 5, 6, 7... order
    weeksToCreate.sort((a, b) => {
      const an = parseInt(a.replace('Tuần ', ''));
      const bn = parseInt(b.replace('Tuần ', ''));
      return an - bn;
    });

    // Create one contribution per week with the same receipt image
    const created = await prisma.$transaction(
      weeksToCreate.map((weekStr) =>
        prisma.contribution.create({
          data: {
            week: weekStr,
            imageUrl: data.imageUrl,
            amount: WEEKLY_AMOUNT,
            status: 'PENDING',
            memberId: dbUser.id,
          },
        }),
      ),
    );

    revalidatePath('/dashboard');
    return { success: true, contributions: created, weeksCreated: created.length };
  } catch (error) {
    console.error('Create contribution error:', error);
    return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' };
  }
}
