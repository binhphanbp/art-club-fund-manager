import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import {
  generateContributionsExcel,
  generateExcelFilename,
} from '@/lib/excel-export';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Get user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 },
      );
    }

    // Get all contributions with member data
    const contributions = await prisma.contribution.findMany({
      include: {
        member: true,
      },
      orderBy: [{ week: 'desc' }, { createdAt: 'desc' }],
    });

    // Generate Excel file
    const buffer = generateContributionsExcel(contributions);
    const filename = generateExcelFilename();

    // Return file as download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi xuất file' },
      { status: 500 },
    );
  }
}
