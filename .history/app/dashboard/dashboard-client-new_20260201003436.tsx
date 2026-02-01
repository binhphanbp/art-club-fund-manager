'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Sparkles,
  LogOut,
  Wallet,
  Calendar,
  TrendingUp,
  Shield,
  Music,
  Mic2,
  Disc3,
  Guitar,
  Plus,
  Check,
  Clock,
  X,
  Upload,
  ImageIcon,
  Loader2,
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

// Helper: Get current week of year
function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

// Helper: Get all weeks of the year
function getWeeksOfYear(): { week: number; label: string }[] {
  const weeks = [];
  for (let i = 1; i <= 52; i++) {
    weeks.push({
      week: i,
      label: `Tuần ${i}`,
    });
  }
  return weeks;
}

// Week status type
type WeekStatus = 'paid' | 'pending' | 'not-paid';

export function DashboardClient({ user, authUser }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const DeptIcon = departmentIcons[user.department];
  const currentWeek = getCurrentWeek();
  const weeks = getWeeksOfYear();

  // Build a map of week -> contribution status
  const weekStatusMap = new Map<number, { status: WeekStatus; contribution?: Contribution }>();
  
  user.contributions.forEach((c) => {
    const weekNum = parseInt(c.week.replace('W', ''));
    if (!isNaN(weekNum)) {
      let status: WeekStatus = 'not-paid';
      if (c.status === 'APPROVED') status = 'paid';
      else if (c.status === 'PENDING') status = 'pending';
      else if (c.status === 'REJECTED') status = 'not-paid';
      
      weekStatusMap.set(weekNum, { status, contribution: c });
    }
  });

  // Get status for a week
  const getWeekStatus = (weekNum: number): WeekStatus => {
    if (weekNum > currentWeek) return 'not-paid'; // Future weeks
    const entry = weekStatusMap.get(weekNum);
    return entry?.status || 'not-paid';
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: WeekStatus }) => {
    const config = {
      paid: {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        icon: Check,
        label: 'Đã nộp',
      },
      pending: {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        icon: Clock,
        label: 'Chờ duyệt',
      },
      'not-paid': {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        icon: X,
        label: 'Chưa nộp',
      },
    };

    const { bg, text, icon: Icon, label } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Calculate stats
  const totalContributions = user.contributions
    .filter((c) => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingContributions = user.contributions.filter((c) => c.status === 'PENDING').length;
  const approvedContributions = user.contributions.filter((c) => c.status === 'APPROVED').length;

  // Check if current week is already submitted
  const currentWeekSubmitted = weekStatusMap.has(currentWeek);
  const currentWeekStatus = getWeekStatus(currentWeek);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle contribution submission
  const handleSubmitContribution = async () => {
    if (!selectedFile) {
      setSubmitError('Vui lòng chọn ảnh chứng minh');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/W${currentWeek}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contributions')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('contributions')
        .getPublicUrl(fileName);

      // Create contribution record via API
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week: `W${currentWeek}`,
          imageUrl: urlData.publicUrl,
          amount: 50000,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      // Success
      setIsDrawerOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      router.refresh();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <span className="hidden sm:inline">Đăng xuất</span>
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {/* Department Card */}
          <div className="relative group">
            <div
              className={`absolute inset-0 bg-linear-to-br ${departmentColors[user.department]} opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity`}
            />
            <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${departmentColors[user.department]} flex items-center justify-center mb-3 sm:mb-4`}
              >
                <DeptIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Ban</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {departmentNames[user.department]}
              </p>
            </div>
          </div>

          {/* Total Contributions */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-green-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-3 sm:mb-4">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Tổng đóng góp</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {totalContributions.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Chờ duyệt</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {pendingContributions}
              </p>
            </div>
          </div>

          {/* Approved */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 sm:mb-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Đã duyệt</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {approvedContributions} tuần
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit Contribution Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                disabled={currentWeekSubmitted}
                className={`w-full sm:w-auto h-14 px-8 rounded-2xl font-semibold text-base shadow-lg transition-all duration-300 ${
                  currentWeekSubmitted
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25 hover:shadow-purple-500/40'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                {currentWeekSubmitted
                  ? `Tuần ${currentWeek} - ${currentWeekStatus === 'paid' ? 'Đã nộp' : 'Đang chờ duyệt'}`
                  : `Nộp Quỹ Tuần ${currentWeek}`}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-xl font-bold">
                  Nộp Quỹ Tuần {currentWeek}
                </DrawerTitle>
                <DrawerDescription>
                  Tải lên ảnh chứng minh đã chuyển khoản 50.000đ
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4">
                {/* Upload area */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isSubmitting}
                  />
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                      previewUrl
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-xl object-cover"
                        />
                        <p className="text-sm text-muted-foreground">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            Chọn ảnh chuyển khoản
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PNG, JPG tối đa 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount info */}
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Số tiền:</span>
                    <span className="text-lg font-bold text-emerald-400">50.000đ</span>
                  </div>
                </div>

                {/* Error message */}
                {submitError && (
                  <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {submitError}
                  </div>
                )}
              </div>

              <DrawerFooter>
                <Button
                  onClick={handleSubmitContribution}
                  disabled={!selectedFile || isSubmitting}
                  className="w-full h-12 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Gửi xác nhận
                    </>
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    Hủy
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </motion.div>

        {/* Weekly Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Lịch sử đóng quỹ 2026</h2>
            <span className="text-sm text-muted-foreground">
              Tuần hiện tại: {currentWeek}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2">
            {weeks.map(({ week, label }) => {
              const status = getWeekStatus(week);
              const isCurrent = week === currentWeek;
              const isFuture = week > currentWeek;

              return (
                <motion.div
                  key={week}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: week * 0.01 }}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center cursor-default transition-all ${
                    isCurrent
                      ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50'
                      : isFuture
                      ? 'border-border/50 bg-card/50 opacity-50'
                      : status === 'paid'
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : status === 'pending'
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">
                    {week}
                  </span>
                  <div className="mt-1">
                    {status === 'paid' && (
                      <Check className="w-3 h-3 text-emerald-400" />
                    )}
                    {status === 'pending' && (
                      <Clock className="w-3 h-3 text-amber-400" />
                    )}
                    {status === 'not-paid' && !isFuture && week <= currentWeek && (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50" />
              <span className="text-xs text-muted-foreground">Đã nộp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50" />
              <span className="text-xs text-muted-foreground">Chờ duyệt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-card border border-border" />
              <span className="text-xs text-muted-foreground">Chưa nộp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500 ring-2 ring-purple-500/50" />
              <span className="text-xs text-muted-foreground">Tuần hiện tại</span>
            </div>
          </div>
        </motion.div>

        {/* Admin Section */}
        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Quản trị viên
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/contributions">
                <Button variant="outline" className="rounded-xl">
                  Duyệt đóng góp
                </Button>
              </Link>
              <Link href="/admin/members">
                <Button variant="outline" className="rounded-xl">
                  Quản lý thành viên
                </Button>
              </Link>
              {user.role === 'SUPER_ADMIN' && (
                <Link href="/admin/settings">
                  <Button variant="outline" className="rounded-xl">
                    Cài đặt hệ thống
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
