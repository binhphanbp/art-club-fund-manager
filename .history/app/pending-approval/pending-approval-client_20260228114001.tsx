'use client';

import { motion } from 'framer-motion';
import { Department } from '@prisma/client';
import {
  Clock,
  XCircle,
  Mic,
  Sparkles,
  Headphones,
  Guitar,
  LogOut,
  Mail,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  fullName: string;
  email: string;
  department: Department;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

const departmentIcons: Record<Department, React.ComponentType<{ className?: string }>> = {
  SINGING: Mic,
  DANCE: Sparkles,
  RAP: Headphones,
  INSTRUMENT: Guitar,
};

const departmentEmoji: Record<Department, string> = {
  SINGING: '🎤',
  DANCE: '💃',
  RAP: '🎧',
  INSTRUMENT: '🎸',
};

export default function PendingApprovalClient({ fullName, email, department, status }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const DeptIcon = departmentIcons[department];

  const isRejected = status === 'REJECTED';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${
            isRejected ? 'bg-red-500' : 'bg-amber-500'
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card glow border */}
        <div
          className={`absolute -inset-px rounded-3xl opacity-40 blur-sm ${
            isRejected
              ? 'bg-linear-to-r from-red-500 to-rose-500'
              : 'bg-linear-to-r from-amber-400 to-orange-500'
          }`}
        />

        <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-8 space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            <motion.div
              animate={isRejected ? {} : { rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                isRejected
                  ? 'bg-red-500/20 shadow-red-500/20'
                  : 'bg-amber-500/20 shadow-amber-500/20'
              }`}
            >
              {isRejected ? (
                <XCircle className="w-10 h-10 text-red-400" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock className="w-10 h-10 text-amber-400" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {isRejected ? 'Đơn bị từ chối' : 'Đang chờ duyệt'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isRejected
                ? 'Rất tiếc, đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.'
                : 'Đơn đăng ký của bạn đang chờ Admin xét duyệt. Bạn sẽ nhận được email thông báo khi được duyệt.'}
            </p>
          </div>

          {/* Member Info */}
          <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Họ tên</span>
              <span className="font-medium text-foreground">{fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground truncate max-w-[180px]">{email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bộ môn</span>
              <span className="font-medium text-foreground flex items-center gap-2">
                <span>{departmentEmoji[department]}</span>
                <DeptIcon className="w-4 h-4" />
                {departmentNames[department]}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isRejected
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {isRejected ? 'Bị từ chối' : 'Chờ duyệt'}
              </span>
            </div>
          </div>

          {/* What happens next */}
          {!isRejected && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quy trình
              </p>
              {[
                { icon: '✅', text: 'Đăng ký tài khoản thành công' },
                { icon: '⏳', text: 'Admin xét duyệt đơn của bạn', active: true },
                { icon: '📧', text: 'Nhận email thông báo kết quả' },
                { icon: '🎉', text: 'Truy cập dashboard và nộp quỹ' },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                    step.active ? 'bg-amber-500/10 text-amber-300' : 'text-muted-foreground'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {!isRejected && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full h-11 rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Kiểm tra lại trạng thái
              </Button>
            )}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="ghost"
              className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>

          {/* Contact hint */}
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" />
            Thắc mắc? Liên hệ Admin CLB Nghệ Thuật
          </p>
        </div>
      </motion.div>
    </main>
  );
}
