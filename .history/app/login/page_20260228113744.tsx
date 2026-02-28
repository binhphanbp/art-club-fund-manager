'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Mic,
  Music,
  Headphones,
  Guitar,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = [
  { value: 'SINGING', label: 'Ca hát', icon: Mic, color: 'from-pink-500 to-rose-500', emoji: '🎤' },
  { value: 'DANCE', label: 'Nhảy', icon: Sparkles, color: 'from-purple-500 to-violet-500', emoji: '💃' },
  { value: 'RAP', label: 'Rap', icon: Headphones, color: 'from-orange-500 to-amber-500', emoji: '🎧' },
  { value: 'INSTRUMENT', label: 'Nhạc cụ', icon: Guitar, color: 'from-blue-500 to-cyan-500', emoji: '🎸' },
] as const;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email hoặc mật khẩu không đúng');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!department) {
      setError('Vui lòng chọn bộ môn của bạn');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department: department,
            status: 'PENDING',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Email này đã được đăng ký');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setError('Email này đã được đăng ký');
        } else if (data.session) {
          router.push('/pending-approval');
        } else {
          setSuccess(
            'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản. Sau đó Admin sẽ duyệt đơn của bạn.',
          );
        }
      }
      setIsLoading(false);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-gradient flex items-center justify-center px-4 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Quay lại</span>
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl opacity-30 blur-xl" />

        <div className="relative bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isSignUp
                ? 'Tham gia CLB Nghệ Thuật ngay hôm nay'
                : 'Chào mừng trở lại CLB Nghệ Thuật'}
            </p>
          </motion.div>

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center"
            >
              {success}
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
            className="space-y-4"
          >
            {/* Full Name - only for sign up */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-12 pl-12 pr-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 pl-12 pr-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password - only for sign up */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium text-base shadow-lg shadow-purple-500/25 transition-all duration-200 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {isSignUp ? 'Đang đăng ký...' : 'Đang đăng nhập...'}
                </>
              ) : isSignUp ? (
                'Đăng ký'
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </motion.form>

          {/* Toggle Sign Up / Sign In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isSignUp ? 'Đăng nhập' : 'Đăng ký ngay'}
              </button>
            </p>
          </motion.div>

          {/* Role info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
          >
            <p className="text-xs text-center text-purple-300">
              💡 Thành viên mới sẽ được cấp quyền <strong>MEMBER</strong>. Liên
              hệ Admin để nâng cấp quyền.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
