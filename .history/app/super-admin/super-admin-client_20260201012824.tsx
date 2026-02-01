'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Department, Role, Settings } from '@prisma/client';
import {
  updateUserRole,
  updateUserDepartment,
  deleteUser,
  updateClubSettings,
} from '@/app/actions/super-admin';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Crown,
  Shield,
  User as UserIcon,
  ArrowLeft,
  Loader2,
  Trash2,
  Settings as SettingsIcon,
  Mic,
  Sparkles,
  Users,
  Guitar,
  Save,
  AlertTriangle,
  Banknote,
  Building2,
  CreditCard,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Extended User type
type UserWithCount = User & {
  _count: {
    contributions: number;
  };
};

interface SuperAdminClientProps {
  initialMembers: UserWithCount[];
  initialSettings: Settings | null;
}

// Department config
const departmentConfig: Record<Department, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  SINGING: { name: 'Ca hát', icon: Mic, color: 'text-pink-400' },
  DANCE: { name: 'Nhảy', icon: Sparkles, color: 'text-purple-400' },
  RAP: { name: 'Rap', icon: Users, color: 'text-orange-400' },
  INSTRUMENT: { name: 'Nhạc cụ', icon: Guitar, color: 'text-blue-400' },
};

// Role config
const roleConfig: Record<Role, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  SUPER_ADMIN: { name: 'Super Admin', icon: Crown, color: 'text-yellow-400' },
  ADMIN: { name: 'Admin', icon: Shield, color: 'text-blue-400' },
  MEMBER: { name: 'Thành viên', icon: UserIcon, color: 'text-gray-400' },
};

export default function SuperAdminClient({
  initialMembers,
  initialSettings,
}: SuperAdminClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [settings, setSettings] = useState(initialSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<UserWithCount | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    weeklyFundAmount: settings?.weeklyFundAmount || 50000,
    clubName: settings?.clubName || 'CLB Nghệ Thuật',
    bankAccount: settings?.bankAccount || '',
    bankName: settings?.bankName || '',
    bankOwner: settings?.bankOwner || '',
  });

  // Filter members
  const filteredMembers = members.filter((member) =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: Role) => {
    setProcessingId(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success(result.message);
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle department change
  const handleDepartmentChange = async (userId: string, newDepartment: Department) => {
    setProcessingId(userId);
    try {
      const result = await updateUserDepartment(userId, newDepartment);
      if (result.success) {
        toast.success(result.message);
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, department: newDepartment } : m))
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  // Open delete drawer
  const openDeleteDrawer = (member: UserWithCount) => {
    setDeletingMember(member);
    setDeleteDrawerOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingMember) return;
    setProcessingId(deletingMember.id);
    try {
      const result = await deleteUser(deletingMember.id);
      if (result.success) {
        toast.success(result.message);
        setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        setDeleteDrawerOpen(false);
        setDeletingMember(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await updateClubSettings(settingsForm);
      if (result.success) {
        toast.success(result.message);
        setSettings(result.settings!);
        setSettingsDrawerOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Super Admin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quản lý thành viên và cài đặt CLB
                </p>
              </div>
            </div>

            {/* Settings Button */}
            <Button
              onClick={() => setSettingsDrawerOpen(true)}
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cài đặt CLB</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Tổng TV</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {members.filter((m) => m.role === 'ADMIN').length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Quỹ/tuần</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {(settings?.weeklyFundAmount || 50000).toLocaleString()}đ
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Ngân hàng</span>
            </div>
            <p className="text-lg font-bold text-foreground truncate">
              {settings?.bankName || 'Chưa cài'}
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border focus:border-purple-500 focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
            <div className="col-span-4">Thành viên</div>
            <div className="col-span-2">Bộ môn</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Đóng góp</div>
            <div className="col-span-2 text-right">Hành động</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {filteredMembers.map((member, index) => {
              const RoleIcon = roleConfig[member.role].icon;
              const DeptIcon = departmentConfig[member.department].icon;
              const isProcessing = processingId === member.id;
              const isSuperAdmin = member.role === 'SUPER_ADMIN';

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 ${isSuperAdmin ? 'bg-yellow-500/5' : ''}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Member info */}
                    <div className="sm:col-span-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold`}>
                        {member.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate flex items-center gap-2">
                          {member.fullName}
                          {isSuperAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>

                    {/* Department dropdown */}
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <select
                          value={member.department}
                          onChange={(e) => handleDepartmentChange(member.id, e.target.value as Department)}
                          disabled={isProcessing}
                          className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-muted border border-border text-sm text-foreground focus:border-purple-500 focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          {(Object.keys(departmentConfig) as Department[]).map((dept) => (
                            <option key={dept} value={dept}>
                              {departmentConfig[dept].name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Role dropdown */}
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          disabled={isProcessing || isSuperAdmin}
                          className={`w-full appearance-none px-3 py-2 pr-8 rounded-lg border text-sm focus:outline-none cursor-pointer disabled:opacity-50 ${
                            member.role === 'ADMIN'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : 'bg-muted border-border text-foreground'
                          } ${isSuperAdmin ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : ''}`}
                        >
                          <option value="MEMBER">Thành viên</option>
                          <option value="ADMIN">Admin</option>
                          {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Contributions count */}
                    <div className="sm:col-span-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                        {member._count.contributions} tuần
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDrawer(member)}
                        disabled={isProcessing || isSuperAdmin}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không tìm thấy thành viên nào</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Settings Drawer */}
      <Drawer open={settingsDrawerOpen} onOpenChange={setSettingsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-purple-400" />
              Cài đặt CLB
            </DrawerTitle>
            <DrawerDescription>
              Thay đổi thông tin quỹ và ngân hàng
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4 overflow-y-auto">
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên CLB
              </label>
              <input
                type="text"
                value={settingsForm.clubName}
                onChange={(e) => setSettingsForm({ ...settingsForm, clubName: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none text-foreground"
              />
            </div>

            {/* Weekly Fund Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số tiền quỹ/tuần (VNĐ)
              </label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="number"
                  value={settingsForm.weeklyFundAmount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, weeklyFundAmount: Number(e.target.value) })}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hiện tại: {settingsForm.weeklyFundAmount.toLocaleString()}đ/tuần
              </p>
            </div>

            {/* Bank Info Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Thông tin ngân hàng
              </h3>

              <div className="space-y-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    placeholder="VD: Vietcombank, MB Bank..."
                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Bank Account */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankAccount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankAccount: e.target.value })}
                    placeholder="VD: 0123456789"
                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Bank Owner */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Chủ tài khoản
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankOwner}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankOwner: e.target.value })}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="w-full h-12 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl"
            >
              {isSavingSettings ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu cài đặt
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

      {/* Delete Confirmation Drawer */}
      <Drawer open={deleteDrawerOpen} onOpenChange={setDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Xóa thành viên
            </DrawerTitle>
            <DrawerDescription>
              Hành động này không thể hoàn tác!
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            {deletingMember && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-foreground">
                  Bạn có chắc muốn xóa <strong>{deletingMember.fullName}</strong>?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tất cả {deletingMember._count.contributions} đóng góp của thành viên này cũng sẽ bị xóa.
                </p>
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={handleDelete}
              disabled={processingId !== null}
              className="w-full h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl"
            >
              {processingId ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5 mr-2" />
                  Xác nhận xóa
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
    </div>
  );
}
