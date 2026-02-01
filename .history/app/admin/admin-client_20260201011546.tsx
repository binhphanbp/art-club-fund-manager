'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Contribution, Department } from '@prisma/client';
import { approveContribution, rejectContribution } from '@/app/actions/admin';
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
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  Music,
  Sparkles,
  Users,
  Guitar,
  Mic,
  ArrowLeft,
  Loader2,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Search,
  Filter,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Extended Contribution type with member
type ContributionWithMember = Contribution & {
  member: User;
};

interface AdminClientProps {
  initialContributions: ContributionWithMember[];
}

// Department display names
const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

// Department icons
const departmentIcons: Record<
  Department,
  React.ComponentType<{ className?: string }>
> = {
  SINGING: Mic,
  DANCE: Sparkles,
  RAP: Users,
  INSTRUMENT: Guitar,
};

// Department colors
const departmentColors: Record<Department, string> = {
  SINGING: 'from-pink-500 to-rose-500',
  DANCE: 'from-purple-500 to-violet-500',
  RAP: 'from-orange-500 to-amber-500',
  INSTRUMENT: 'from-blue-500 to-cyan-500',
};

export default function AdminClient({
  initialContributions,
}: AdminClientProps) {
  const [contributions, setContributions] = useState(initialContributions);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false);
  const [rejectingContribution, setRejectingContribution] =
    useState<ContributionWithMember | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'ALL'>('ALL');

  // Filter contributions based on search and department
  const filteredContributions = useMemo(() => {
    return contributions.filter((contribution) => {
      // Filter by search query (name)
      const matchesSearch = searchQuery === '' || 
        contribution.member.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by department
      const matchesDepartment = selectedDepartment === 'ALL' || 
        contribution.member.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [contributions, searchQuery, selectedDepartment]);

  // Handle approve
  const handleApprove = async (contribution: ContributionWithMember) => {
    setProcessingId(contribution.id);

    try {
      const result = await approveContribution(contribution.id);

      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        });
        // Remove from local state
        setContributions((prev) =>
          prev.filter((c) => c.id !== contribution.id),
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

  // Open reject drawer
  const openRejectDrawer = (contribution: ContributionWithMember) => {
    setRejectingContribution(contribution);
    setRejectReason('');
    setRejectDrawerOpen(true);
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectingContribution) return;

    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(rejectingContribution.id);

    try {
      const result = await rejectContribution(
        rejectingContribution.id,
        rejectReason,
      );

      if (result.success) {
        toast.success(result.message, {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
        });
        // Remove from local state
        setContributions((prev) =>
          prev.filter((c) => c.id !== rejectingContribution.id),
        );
        setRejectDrawerOpen(false);
        setRejectingContribution(null);
        setRejectReason('');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Quản lý đóng góp
              </h1>
              <p className="text-sm text-muted-foreground">
                {contributions.length} đóng góp đang chờ duyệt
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {contributions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Không có đóng góp nào đang chờ
            </h2>
            <p className="text-muted-foreground">
              Tất cả đóng góp đã được xử lý xong! 🎉
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {contributions.map((contribution, index) => {
                const DeptIcon =
                  departmentIcons[contribution.member.department];
                const isProcessing = processingId === contribution.id;

                return (
                  <motion.div
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="p-4 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(contribution.imageUrl)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-muted group"
                      >
                        <img
                          src={contribution.imageUrl}
                          alt={`${contribution.week} receipt`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </motion.button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              {contribution.member.fullName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DeptIcon className="w-4 h-4" />
                              <span>
                                {
                                  departmentNames[
                                    contribution.member.department
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {contribution.week}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span>
                            {new Date(
                              contribution.createdAt,
                            ).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">
                            {contribution.amount.toLocaleString()}đ
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(contribution)}
                            disabled={isProcessing}
                            className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Duyệt
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDrawer(contribution)}
                            disabled={isProcessing}
                            className="flex-1 h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Receipt"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Drawer */}
      <Drawer open={rejectDrawerOpen} onOpenChange={setRejectDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Từ chối đóng góp
            </DrawerTitle>
            <DrawerDescription>
              {rejectingContribution && (
                <span>
                  {rejectingContribution.member.fullName} -{' '}
                  {rejectingContribution.week}
                </span>
              )}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (VD: Ảnh không rõ, sai số tiền...)"
              className="w-full h-32 px-4 py-3 rounded-xl bg-muted border border-border focus:border-purple-500 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <DrawerFooter>
            <Button
              onClick={handleReject}
              disabled={processingId !== null || !rejectReason.trim()}
              className="w-full h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl"
            >
              {processingId ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  Xác nhận từ chối
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                disabled={processingId !== null}
              >
                Hủy
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
