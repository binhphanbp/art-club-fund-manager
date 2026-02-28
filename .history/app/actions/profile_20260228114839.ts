'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { user: null, supabase: null };
  return { user, supabase };
}

// ─── Update profile info (fullName + bio) ─────────────────────────────────────
export async function updateProfileInfo(fullName: string, bio: string) {
  const { user } = await getAuthUser();
  if (!user) return { success: false, error: 'Chưa đăng nhập' };

  const trimmedName = fullName.trim();
  if (!trimmedName) return { success: false, error: 'Tên không được để trống' };
  if (trimmedName.length > 80) return { success: false, error: 'Tên quá dài (tối đa 80 ký tự)' };
  if (bio.length > 200) return { success: false, error: 'Bio quá dài (tối đa 200 ký tự)' };

  try {
    await prisma.user.update({
      where: { email: user.email! },
      data: {
        fullName: trimmedName,
        bio: bio.trim() || null,
      } as any,
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, message: 'Đã cập nhật thông tin thành công' };
  } catch (err: any) {
    console.error('updateProfileInfo error:', err);
    return { success: false, error: err.message || 'Có lỗi xảy ra' };
  }
}

// ─── Persist avatar URL after client-side upload ──────────────────────────────
export async function updateAvatarUrl(avatarUrl: string) {
  const { user } = await getAuthUser();
  if (!user) return { success: false, error: 'Chưa đăng nhập' };

  try {
    await prisma.user.update({
      where: { email: user.email! },
      data: { avatarUrl } as any,
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, message: 'Đã cập nhật ảnh đại diện' };
  } catch (err: any) {
    console.error('updateAvatarUrl error:', err);
    return { success: false, error: err.message || 'Có lỗi xảy ra' };
  }
}
