'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Contribution, Department } from '@prisma/client';
import { UploadFundForm } from '@/components/upload-fund-form';
import {
  Wallet,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Music,
  Sparkles,
  Crown,
  Shield,
  LogOut,
  Mic,
  Guitar,
  Headphones,
  Disc3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Define extended User type with relations
type UserWithRelations = User & {
  contributions: Contribution[];
};

interface DashboardClientProps {
  user: UserWithRelations;
}

// Department icons mapping
const departmentIcons: Record<
  Department,
  React.ComponentType<{ className?: string }>
> = {
  SINGING: Mic,
  DANCE: Sparkles,
  RAP: Users,
  INSTRUMENT: Guitar,
};

// Department display names
const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

// Get department icon
const getDepartmentIcon = (department: Department) => {
  return departmentIcons[department] || Music;
};

// Get current week of year
const getCurrentWeek = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// Get all weeks of year with their status
const getWeeksOfYear = (
  contributions: Contribution[],
): Array<{
  week: number;
  status: 'paid' | 'pending' | 'not-paid';
  contribution?: Contribution;
}> => {
  const currentWeek = getCurrentWeek();
  const weeks: Array<{
    week: number;
    status: 'paid' | 'pending' | 'not-paid';
    contribution?: Contribution;
  }> = [];

  for (let i = 1; i <= 52; i++) {
    // Find contribution for this week
    const contribution = contributions.find((c) => c.week === `Tuần ${i}`);

    let status: 'paid' | 'pending' | 'not-paid';
    if (contribution) {
      status = contribution.status === 'APPROVED' ? 'paid' : 'pending';
    } else if (i > currentWeek) {
      status = 'not-paid'; // Future weeks
    } else {
      status = 'not-paid'; // Past weeks without contribution
    }

    weeks.push({ week: i, status, contribution });
  }

  return weeks;
};

// Status color mapping
const statusColors = {
  paid: 'bg-emerald-500 shadow-emerald-500/50',
  pending: 'bg-amber-500 shadow-amber-500/50',
  'not-paid': 'bg-gray-600 shadow-gray-500/50',
};

const statusLabels = {
  paid: 'Đã duyệt',
  pending: 'Đang chờ',
  'not-paid': 'Chưa nộp',
};

// Vibe Check departments config
const vibeCheckDepartments = [
  {
    icon: Mic,
    name: 'Singing',
    color: 'from-pink-500 to-rose-500',
    emoji: '🎤',
  },
  {
    icon: Sparkles,
    name: 'Dancing',
    color: 'from-purple-500 to-violet-500',
    emoji: '💃',
  },
  {
    icon: Headphones,
    name: 'Rap',
    color: 'from-orange-500 to-amber-500',
    emoji: '🎧',
  },
  {
    icon: Guitar,
    name: 'Instruments',
    color: 'from-blue-500 to-cyan-500',
    emoji: '🎸',
  },
];

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentWeek = getCurrentWeek();
  const weeks = useMemo(
    () => getWeeksOfYear(user.contributions),
    [user.contributions],
  );

  // Calculate stats
  const totalPaid = user.contributions.filter(
    (c) => c.status === 'APPROVED',
  ).length;
  const totalPending = user.contributions.filter(
    (c) => c.status === 'PENDING',
  ).length;
  const totalAmount = totalPaid * 50000;

  // Check if current week is already submitted
  const currentWeekData = weeks.find((w) => w.week === currentWeek);
  const isCurrentWeekSubmitted = currentWeekData?.status !== 'not-paid';

  const DepartmentIcon = getDepartmentIcon(user.department);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {user.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="font-bold text-foreground flex items-center gap-2">
                  {user.fullName}
                  {user.role === 'SUPER_ADMIN' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  {user.role === 'ADMIN' && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DepartmentIcon className="w-3 h-3" />
                  {departmentNames[user.department]}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Department */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <DepartmentIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bộ môn</p>
                <p className="font-semibold text-foreground">
                  {departmentNames[user.department]}
                </p>
              </div>
            </div>
          </div>

          {/* Total paid */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đã nộp</p>
                <p className="font-semibold text-foreground">
                  {totalAmount.toLocaleString()}đ
                </p>
              </div>
            </div>
          </div>

          {/* Weeks paid */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tuần đã duyệt</p>
                <p className="font-semibold text-foreground">
                  {totalPaid}/{currentWeek}
                </p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đang chờ duyệt</p>
                <p className="font-semibold text-foreground">{totalPending}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vibe Check Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-900/50 via-pink-900/30 to-violet-900/50 border border-purple-500/20 p-6"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative z-10">
            {/* Title with floating disc */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Disc3 className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Vibe Check ✨
              </h2>
            </div>

            <p className="text-center text-muted-foreground text-sm mb-6">
              CLB Nghệ Thuật - Nơi đam mê thăng hoa 🎭
            </p>

            {/* Department icons row */}
            <div className="flex justify-center gap-4 sm:gap-6">
              {vibeCheckDepartments.map((dept, index) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${dept.color} flex items-center justify-center shadow-lg cursor-pointer`}
                  >
                    <dept.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  {/* Emoji floating above on hover */}
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: -5 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl pointer-events-none"
                  >
                    {dept.emoji}
                  </motion.span>

                  {/* Name below */}
                  <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                    {dept.name}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Current user's department highlight */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <DepartmentIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-foreground">
                  Bạn thuộc bộ môn:{' '}
                  <span className="font-semibold text-purple-400">
                    {departmentNames[user.department]}
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Upload button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <UploadFundForm
            currentWeek={currentWeek}
            isAlreadySubmitted={isCurrentWeekSubmitted}
            currentWeekStatus={currentWeekData?.status || 'not-paid'}
            userId={user.id}
          />
        </motion.div>

        {/* Week grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Lịch Sử Nộp Quỹ 2025
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground hidden sm:inline">
                  Đã duyệt
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground hidden sm:inline">
                  Chờ duyệt
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <span className="text-muted-foreground hidden sm:inline">
                  Chưa nộp
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2">
            {weeks.map((weekData) => (
              <motion.button
                key={weekData.week}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedWeek(
                    selectedWeek === weekData.week ? null : weekData.week,
                  )
                }
                className={`relative aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all ${statusColors[weekData.status]} shadow-lg ${
                  weekData.week === currentWeek
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background'
                    : ''
                } ${selectedWeek === weekData.week ? 'ring-2 ring-white' : ''}`}
              >
                {weekData.week}
                {weekData.week === currentWeek && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Selected week detail */}
          <AnimatePresence>
            {selectedWeek && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${statusColors[weeks[selectedWeek - 1].status]} flex items-center justify-center`}
                    >
                      {weeks[selectedWeek - 1].status === 'paid' && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                      {weeks[selectedWeek - 1].status === 'pending' && (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                      {weeks[selectedWeek - 1].status === 'not-paid' && (
                        <AlertCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Tuần {selectedWeek}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {statusLabels[weeks[selectedWeek - 1].status]}
                      </p>
                    </div>
                  </div>
                  {weeks[selectedWeek - 1].contribution?.imageUrl && (
                    <a
                      href={weeks[selectedWeek - 1].contribution?.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 hover:text-purple-300 underline"
                    >
                      Xem ảnh
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Admin section - only for ADMIN and SUPER_ADMIN */}
        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-foreground">Quản trị viên</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-purple-500/30 hover:bg-purple-500/10"
                onClick={() => router.push('/admin')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Duyệt đóng góp
              </Button>
              {user.role === 'SUPER_ADMIN' ? (
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400"
                  onClick={() => router.push('/super-admin')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Super Admin
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => router.push('/admin/members')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Quản lý TV
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
