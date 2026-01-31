'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Wallet,
  Calendar,
  TrendingUp,
  Shield,
  Music,
  Mic2,
  Disc3,
  Guitar,
} from 'lucide-react';
import Link from 'next/link';
import type { User, Contribution } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User & { contributions: Contribution[] };
  authUser: SupabaseUser;
}

const departmentIcons = {
  SINGING: Mic2,
  DANCE: Music,
  RAP: Disc3,
  INSTRUMENT: Guitar,
};

const departmentNames = {
  SINGING: 'Singing',
  DANCE: 'Dance',
  RAP: 'Rap',
  INSTRUMENT: 'Instruments',
};

const departmentColors = {
  SINGING: 'from-pink-500 to-rose-500',
  DANCE: 'from-purple-500 to-violet-500',
  RAP: 'from-amber-500 to-orange-500',
  INSTRUMENT: 'from-cyan-500 to-blue-500',
};

const roleColors = {
  SUPER_ADMIN: 'from-yellow-400 to-orange-500',
  ADMIN: 'from-purple-500 to-violet-500',
  MEMBER: 'from-blue-500 to-cyan-500',
};

const roleNames = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MEMBER: 'Thành viên',
};

export function DashboardClient({ user, authUser }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const DeptIcon = departmentIcons[user.department];

  // Calculate stats
  const totalContributions = user.contributions.reduce(
    (sum, c) => sum + c.amount,
    0,
  );
  const pendingContributions = user.contributions.filter(
    (c) => c.status === 'PENDING',
  ).length;
  const approvedContributions = user.contributions.filter(
    (c) => c.status === 'APPROVED',
  ).length;

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:block">
                Art Club
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Xin chào, {user.fullName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Chào mừng bạn đến với bảng điều khiển CLB Nghệ Thuật
              </p>
            </div>

            {/* Role Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r ${roleColors[user.role]} text-white text-sm font-semibold shadow-lg`}
            >
              <Shield className="w-4 h-4" />
              {roleNames[user.role]}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {/* Department Card */}
          <div className="relative group">
            <div
              className={`absolute inset-0 bg-linear-to-br ${departmentColors[user.department]} opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity`}
            />
            <div className="relative bg-card border border-border rounded-2xl p-6">
              <div
                className={`w-12 h-12 rounded-xl bg-linear-to-br ${departmentColors[user.department]} flex items-center justify-center mb-4`}
              >
                <DeptIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">Ban</p>
              <p className="text-xl font-bold text-foreground">
                {departmentNames[user.department]}
              </p>
            </div>
          </div>

          {/* Total Contributions */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-green-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">
                Tổng đóng góp
              </p>
              <p className="text-xl font-bold text-foreground">
                {totalContributions.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">Chờ duyệt</p>
              <p className="text-xl font-bold text-foreground">
                {pendingContributions}
              </p>
            </div>
          </div>

          {/* Approved */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-cyan-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">Đã duyệt</p>
              <p className="text-xl font-bold text-foreground">
                {approvedContributions}
              </p>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Thông tin tài khoản
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Họ tên</p>
              <p className="text-foreground">{user.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Ngày tham gia
              </p>
              <p className="text-foreground">
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Quyền hạn</p>
              <p className="text-foreground">{roleNames[user.role]}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Contributions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Đóng góp gần đây
          </h2>

          {user.contributions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Chưa có đóng góp nào</p>
              <Button className="mt-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full">
                Đóng góp ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {user.contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {contribution.week}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contribution.createdAt).toLocaleDateString(
                        'vi-VN',
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {contribution.amount.toLocaleString('vi-VN')}đ
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        contribution.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : contribution.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {contribution.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : contribution.status === 'PENDING'
                          ? 'Chờ duyệt'
                          : 'Từ chối'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Admin Section - Only visible for ADMIN and SUPER_ADMIN */}
        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Quản trị viên
            </h2>
            <p className="text-muted-foreground mb-4">
              Bạn có quyền{' '}
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}. Truy cập
              trang quản trị để quản lý thành viên và đóng góp.
            </p>
            <Link href="/admin">
              <Button className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full">
                Đi đến trang quản trị
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
