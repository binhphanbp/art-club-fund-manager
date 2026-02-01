import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get request body
    const body = await request.json();
    const { week, imageUrl, amount } = body;

    if (!week || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if contribution for this week already exists
    const existingContribution = await prisma.contribution.findFirst({
      where: {
        memberId: dbUser.id,
        week: week,
      },
    });

    if (existingContribution) {
      return NextResponse.json(
        { error: 'Bạn đã nộp quỹ tuần này rồi' },
        { status: 400 },
      );
    }

    // Create new contribution
    const contribution = await prisma.contribution.create({
      data: {
        week,
        imageUrl,
        amount: amount || 50000,
        status: 'PENDING',
        memberId: dbUser.id,
      },
    });

    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (error) {
    console.error('Contribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all contributions for this user
    const contributions = await prisma.contribution.findMany({
      where: { memberId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Get contributions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
