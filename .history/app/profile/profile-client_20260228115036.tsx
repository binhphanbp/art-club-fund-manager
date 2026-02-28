'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Department, Role } from '@prisma/client';
import {
  Camera,
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  Music,
  Shield,
  Crown,
  AlignLeft,
  Edit3,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Mic,
  Sparkles,
  Headphones,
  Guitar,
  Star,
  Wallet,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { updateProfileInfo, updateAvatarUrl } from '@/app/actions/profile';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  department: Department;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

interface ProfileClientProps {
  user: ProfileUser;
  stats: {
    totalContributions: number;
    totalAmount: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
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

const roleConfig: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', icon: Crown, color: 'text-amber-400 bg-amber-400/15 border-amber-400/30' },
  ADMIN: { label: 'Admin', icon: Shield, color: 'text-blue-400 bg-blue-400/15 border-blue-400/30' },
  MEMBER: { label: 'Thành viên', icon: Star, color: 'text-pink-400 bg-pink-400/15 border-pink-400/30' },
};

// ─── Image helpers ─────────────────────────────────────────────────────────────
async function compressAndCropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Center-crop to square
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      // Render at 400×400 max
      const dim = Math.min(size, 400);
      const canvas = document.createElement('canvas');
      canvas.width = dim;
      canvas.height = dim;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, sx, sy, size, size, 0, 0, dim, dim);

      // Reduce quality until <200 KB
      let quality = 0.92;

      const attempt = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Failed to create blob'));
            if (blob.size <= 200 * 1024 || quality <= 0.1) {
              resolve(blob);
            } else {
              quality = Math.max(quality - 0.08, 0.1);
              attempt();
            }
          },
          'image/jpeg',
          quality,
        );
      };
      attempt();
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProfileClient({ user, stats }: ProfileClientProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const DeptIcon = departmentIcons[user.department];
  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Compress + crop
      const compressed = await compressAndCropToSquare(file);

      // Show preview immediately
      const preview = URL.createObjectURL(compressed);
      setAvatarPreview(preview);

      // Upload to Supabase avatars bucket
      const ext = 'jpg';
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressed, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Persist to DB
      const result = await updateAvatarUrl(publicUrl);
      if (!result.success) throw new Error(result.error);

      setAvatarUrl(publicUrl);
      URL.revokeObjectURL(preview);
      setAvatarPreview(null);
      toast.success('Đã cập nhật ảnh đại diện ✨');
    } catch (err: any) {
      setAvatarPreview(null);
      toast.error(err.message ?? 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [user.id, supabase]);

  // ── Save profile info ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      const result = await updateProfileInfo(fullName, bio);
      if (!result.success) throw new Error(result.error);
      toast.success(result.message ?? 'Đã lưu thay đổi');
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = avatarPreview ?? avatarUrl;

  return (
    <div className="min-h-screen bg-[#070709] relative overflow-x-hidden">
      {/* ── Ambient background ────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gold orb top-right */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.26, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f59e0b55 0%, transparent 70%)' }}
        />
        {/* Pink orb bottom-left */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-60 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #ec489955 0%, transparent 70%)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hồ sơ cá nhân</h1>
            <p className="text-xs text-muted-foreground">Quản lý thông tin của bạn</p>
          </div>
        </motion.div>

        {/* ── Avatar + Identity card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="relative"
        >
          {/* Gold border glow */}
          <div className="absolute -inset-px rounded-3xl opacity-50 blur-sm bg-linear-to-r from-amber-500/40 via-pink-500/20 to-amber-500/40" />

          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6">
            {/* Inner top shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0 group">
                {/* Neon ring */}
                <div className="absolute inset-0 rounded-full blur-md opacity-60 bg-linear-to-br from-amber-400 to-pink-500 scale-110" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/60">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt={user.fullName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-amber-500/30 to-pink-500/30 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-amber-400/60" />
                    </div>
                  )}
                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-[10px] text-white font-medium">Đổi ảnh</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Upload button on mobile */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="sm:hidden absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-[#070709] flex items-center justify-center shadow-lg shadow-amber-500/40"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 text-white" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Identity */}
              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{fullName}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {/* Role badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleInfo.label}
                  </span>

                  {/* Department badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-slate-300 bg-white/5 border-white/10">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    {departmentEmoji[user.department]}
                    {departmentNames[user.department]}
                  </span>
                </div>

                {/* Bio preview */}
                {user.bio && !isDirty && (
                  <p className="text-xs text-muted-foreground italic max-w-xs">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Bottom shimmer */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-pink-400/30 to-transparent" />
          </div>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            {
              icon: CheckCircle2,
              label: 'Đóng góp',
              value: stats.totalContributions.toString(),
              accent: 'text-emerald-400',
              glow: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20',
            },
            {
              icon: Wallet,
              label: 'Tổng quỹ',
              value: stats.totalAmount.toLocaleString('vi-VN') + '₫',
              accent: 'text-amber-400',
              glow: 'from-amber-500/15 to-amber-600/5 border-amber-500/20',
            },
            {
              icon: Calendar,
              label: 'Tham gia',
              value: new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
              accent: 'text-pink-400',
              glow: 'from-pink-500/15 to-pink-600/5 border-pink-500/20',
            },
          ].map(({ icon: Icon, label, value, accent, glow }) => (
            <div
              key={label}
              className={`p-4 rounded-2xl bg-linear-to-br border backdrop-blur-xl ${glow} flex flex-col items-center text-center gap-1`}
            >
              <Icon className={`w-4 h-4 ${accent} mb-0.5`} />
              <p className={`text-sm sm:text-base font-bold ${accent} leading-none`}>{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Edit form ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="relative"
        >
          <div className="absolute -inset-px rounded-3xl opacity-40 blur-sm bg-linear-to-r from-pink-500/30 via-transparent to-amber-500/30" />

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-pink-400/40 to-transparent" />

            {/* Section header */}
            <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b border-white/[0.07]">
              <Edit3 className="w-4 h-4 text-pink-400" />
              <h3 className="font-semibold text-foreground text-sm">Chỉnh sửa thông tin</h3>
            </div>

            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" />
                  Họ và tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    maxLength={80}
                    onChange={(e) => { setFullName(e.target.value); setIsDirty(true); }}
                    placeholder="Nhập họ và tên..."
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 text-sm outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 focus:bg-white/8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/40">
                    {fullName.length}/80
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-3 h-3" />
                  Bio
                  <span className="text-muted-foreground/40 normal-case tracking-normal font-normal">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={bio}
                    maxLength={200}
                    rows={3}
                    onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
                    placeholder="Giới thiệu bản thân trong vài dòng..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 text-sm outline-none resize-none transition-all focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/15 focus:bg-white/8 leading-relaxed"
                  />
                  <span className="absolute right-3 bottom-2 text-[11px] text-muted-foreground/40">
                    {bio.length}/200
                  </span>
                </div>
              </div>

              {/* Department (locked) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3 h-3" />
                  Bộ môn
                  <span className="inline-flex items-center gap-1 text-muted-foreground/50 normal-case tracking-normal font-normal">
                    <Lock className="w-2.5 h-2.5" />
                    Chỉ Admin mới có thể thay đổi
                  </span>
                </label>
                <div className="h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-2 cursor-not-allowed">
                  <DeptIcon className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground/60">
                    {departmentEmoji[user.department]} {departmentNames[user.department]}
                  </span>
                  <Lock className="w-3 h-3 text-muted-foreground/30 ml-auto" />
                </div>
              </div>

              {/* Save button */}
              <div className="pt-1">
                <AnimatePresence mode="wait">
                  {isDirty ? (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !fullName.trim()}
                        className="w-full h-11 rounded-xl font-semibold shadow-lg transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                          boxShadow: '0 0 20px #f59e0b30, 0 0 40px #ec489920',
                        }}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60 py-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                      Đã đồng bộ
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-400/20 to-transparent" />
          </div>
        </motion.div>

        {/* ── Avatar upload tip ──────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-[11px] text-center text-muted-foreground/40 pb-4"
        >
          Ảnh đại diện được tự động cắt vuông và nén dưới 200KB • Nhấp vào ảnh để thay đổi
        </motion.p>
      </div>
    </div>
  );
}
