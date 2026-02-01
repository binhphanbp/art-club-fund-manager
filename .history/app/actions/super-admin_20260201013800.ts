'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Role, Department } from '@prisma/client';

// Check if user is super admin
async function checkSuperAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, error: 'Chưa đăng nhập' };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Không có quyền Super Admin' };
  }

  return { success: true, user: dbUser };
}

// Get all members
export async function getAllMembers() {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error, members: [] };
    }

    const members = await prisma.user.findMany({
      include: {
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    });

    return { success: true, members };
  } catch (error: any) {
    console.error('Get all members error:', error);
    return { success: false, error: error.message, members: [] };
  }
}

// Update user role
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    // Prevent changing own role
    if (userId === accessCheck.user?.id) {
      return {
        success: false,
        error: 'Không thể thay đổi role của chính mình',
      };
    }

    // Prevent setting someone as SUPER_ADMIN
    if (newRole === 'SUPER_ADMIN') {
      return { success: false, error: 'Không thể đặt role SUPER_ADMIN' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath('/super-admin');

    return {
      success: true,
      message: `Đã cập nhật ${user.fullName} thành ${newRole}`,
    };
  } catch (error: any) {
    console.error('Update user role error:', error);
    return { success: false, error: error.message };
  }
}

// Update user department
export async function updateUserDepartment(
  userId: string,
  newDepartment: Department,
) {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { department: newDepartment },
    });

    revalidatePath('/super-admin');

    return {
      success: true,
      message: `Đã cập nhật bộ môn của ${user.fullName}`,
    };
  } catch (error: any) {
    console.error('Update user department error:', error);
    return { success: false, error: error.message };
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    // Prevent deleting self
    if (userId === accessCheck.user?.id) {
      return { success: false, error: 'Không thể xóa chính mình' };
    }

    const user = await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/super-admin');

    return {
      success: true,
      message: `Đã xóa thành viên ${user.fullName}`,
    };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return { success: false, error: error.message };
  }
}

// Get club settings
export async function getClubSettings() {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error, settings: null };
    }

    // Get or create settings
    let settings = await prisma.settings.findUnique({
      where: { id: 'club-settings' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'club-settings' },
      });
    }

    return { success: true, settings };
  } catch (error: any) {
    console.error('Get club settings error:', error);
    return { success: false, error: error.message, settings: null };
  }
}

// Update club settings
export async function updateClubSettings(data: {
  weeklyFundAmount?: number;
  clubName?: string;
  bankAccount?: string;
  bankName?: string;
  bankOwner?: string;
}) {
  try {
    const accessCheck = await checkSuperAdminAccess();
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    const settings = await prisma.settings.upsert({
      where: { id: 'club-settings' },
      update: data,
      create: {
        id: 'club-settings',
        ...data,
      },
    });

    revalidatePath('/super-admin');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Đã cập nhật cài đặt CLB',
      settings,
    };
  } catch (error: any) {
    console.error('Update club settings error:', error);
    return { success: false, error: error.message };
  }
}
