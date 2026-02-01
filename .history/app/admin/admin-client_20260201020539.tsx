'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Contribution, Department } from '@prisma/client';
import { approveContribution, rejectContribution } from '@/app/actions/admin';
import { sendBulkReminderEmails, getUnpaidMembers } from '@/app/actions/email';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Zap,
  Mail,
  Send,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  PartyPopper,
  Coffee,
  Palette,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Check,
  CircleDashed,
  BarChart3,
  CalendarCheck,
  UserX,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Extended Contribution type with member
type ContributionWithMember = Contribution & {
  member: User;
};

// Statistics type
interface Statistics {
  totalApprovedFunds: number;
  pendingThisWeek: number;
  totalPending: number;
  completionRate: number;
  totalMembers: number;
  paidMembers: number;
  currentWeek: string;
  weeklyTrends: { week: string; amount: number; shortWeek: string }[];
}

// Matrix data type
interface MatrixMember {
  id: string;
  fullName: string;
  email: string;
  department: Department;
}

interface MatrixContribution {
  id: string;
  memberId: string;
  week: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl: string;
  amount: number;
}

interface MatrixData {
  weeks: string[];
  members: MatrixMember[];
  contributions: MatrixContribution[];
  currentWeek: string;
}

// Analytics data type
interface DepartmentStat {
  department: string;
  approved: number;
  pending: number;
  total: number;
  memberCount: number;
}

interface AnalyticsData {
  totalBalance: number;
  monthlyRevenue: number;
  debtorsCount: number;
  weeklyTrends: { week: string; amount: number; shortWeek: string }[];
  departmentStats: DepartmentStat[];
  currentMonth: string;
  isMonthClosed: boolean;
  closedAt?: Date;
}

interface AdminClientProps {
  initialContributions: ContributionWithMember[];
  statistics: Statistics;
  matrixData: MatrixData;
  analyticsData: AnalyticsData;
  userRole: 'ADMIN' | 'SUPER_ADMIN';
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

// Framer Motion variants for stagger animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// Bar chart colors
const chartColors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1'];
const analyticsChartColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#059669', '#047857'];

// Department chart colors
const departmentChartColors: Record<string, string> = {
  SINGING: '#ec4899',
  DANCE: '#a855f7',
  RAP: '#f97316',
  INSTRUMENT: '#3b82f6',
};

export default function AdminClient({
  initialContributions,
  statistics,
  matrixData,
  analyticsData,
  userRole,
}: AdminClientProps) {
  const [contributions, setContributions] = useState(initialContributions);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDrawerOpen, setRejectDrawerOpen] = useState(false);
  const [rejectingContribution, setRejectingContribution] =
    useState<ContributionWithMember | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Nuclear option states
  const [nuclearDrawerOpen, setNuclearDrawerOpen] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | 'ALL'
  >('ALL');

  // Export Excel state
  const [isExporting, setIsExporting] = useState(false);

  // Matrix view states
  const [activeView, setActiveView] = useState<'queue' | 'matrix' | 'analytics'>('queue');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [selectedPendingCell, setSelectedPendingCell] = useState<MatrixContribution | null>(null);

  // Build contribution lookup map for matrix
  const contributionMap = useMemo(() => {
    const map = new Map<string, MatrixContribution>();
    matrixData.contributions.forEach((c) => {
      const key = `${c.memberId}-${c.week}`;
      map.set(key, c);
    });
    return map;
  }, [matrixData.contributions]);

  // Filter matrix members
  const filteredMatrixMembers = useMemo(() => {
    if (!matrixSearchQuery) return matrixData.members;
    return matrixData.members.filter((m) =>
      m.fullName.toLowerCase().includes(matrixSearchQuery.toLowerCase()),
    );
  }, [matrixData.members, matrixSearchQuery]);

  // Filter contributions based on search and department
  const filteredContributions = useMemo(() => {
    return contributions.filter((contribution) => {
      // Filter by search query (name)
      const matchesSearch =
        searchQuery === '' ||
        contribution.member.fullName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filter by department
      const matchesDepartment =
        selectedDepartment === 'ALL' ||
        contribution.member.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [contributions, searchQuery, selectedDepartment]);

  // Open image in dialog
  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1);
    setImageDialogOpen(true);
  };

  // Close image dialog
  const closeImageDialog = () => {
    setImageDialogOpen(false);
    setZoomLevel(1);
    setTimeout(() => setSelectedImage(null), 200);
  };

  // Zoom controls
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Download image
  const downloadImage = async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải ảnh xuống!', {
        icon: <Download className="w-5 h-5 text-emerald-500" />,
      });
    } catch (error) {
      toast.error('Không thể tải ảnh');
    }
  };

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

  // Open Nuclear Option Drawer
  const openNuclearDrawer = async () => {
    // Get unpaid count first
    const result = await getUnpaidMembers();
    if (result.success) {
      setUnpaidCount(result.unpaidCount || 0);
    }
    setNuclearDrawerOpen(true);
  };

  // Handle Nuclear Option - Send reminder to all unpaid members
  const handleNuclearOption = async () => {
    setIsSendingEmails(true);

    const toastId = toast.loading(
      `Đang gửi email nhắc nhở đến ${unpaidCount} thành viên...`,
      {
        icon: <Mail className="w-5 h-5 text-purple-500 animate-pulse" />,
      },
    );

    try {
      const result = await sendBulkReminderEmails();

      if (result.success) {
        toast.success(result.message, {
          id: toastId,
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          duration: 5000,
        });
        setNuclearDrawerOpen(false);
      } else {
        toast.error(result.error || 'Có lỗi xảy ra', {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi email', {
        id: toastId,
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  // Handle Export to Excel
  const handleExportExcel = async () => {
    setIsExporting(true);

    const toastId = toast.loading('Đang tạo file Excel...', {
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500 animate-pulse" />,
    });

    try {
      const response = await fetch('/api/export-excel');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Quy_CLB_NgheThuat.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải xuống file Excel!', {
        id: toastId,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      });
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xuất file', {
        id: toastId,
      });
    } finally {
      setIsExporting(false);
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                Quản lý đóng góp
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredContributions.length} / {contributions.length} đóng góp
                đang chờ duyệt
              </p>
            </div>

            {/* Export Excel Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                variant="outline"
                className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Xuất Excel</span>
              </Button>
            </motion.div>

            {/* Nuclear Option Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={openNuclearDrawer}
                className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg shadow-red-500/25"
              >
                <Zap className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nhắc nhở toàn CLB</span>
                <span className="sm:hidden">Nhắc nhở</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl w-fit">
          <Button
            variant={activeView === 'queue' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('queue')}
            className={`rounded-lg ${activeView === 'queue' ? 'bg-purple-600 hover:bg-purple-500' : ''}`}
          >
            <List className="w-4 h-4 mr-2" />
            Hàng đợi
          </Button>
          <Button
            variant={activeView === 'matrix' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('matrix')}
            className={`rounded-lg ${activeView === 'matrix' ? 'bg-purple-600 hover:bg-purple-500' : ''}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Ma trận
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('analytics')}
            className={`rounded-lg ${activeView === 'analytics' ? 'bg-purple-600 hover:bg-purple-500' : ''}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Thống kê
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {activeView === 'queue' ? (
          <>
            {/* Statistics Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Approved Funds */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-5 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Tổng quỹ đã duyệt
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                      {statistics.totalApprovedFunds.toLocaleString()}đ
                    </p>
                  </div>
                </motion.div>

                {/* Pending This Week */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-5 rounded-2xl bg-linear-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Chờ duyệt tuần này
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                  {statistics.pendingThisWeek}
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    / {statistics.totalPending} tổng
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Member Completion Rate */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-5 rounded-2xl bg-linear-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Tỷ lệ hoàn thành ({statistics.currentWeek})
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-400">
                    {statistics.completionRate}%
                  </p>
                  <span className="text-sm text-muted-foreground mb-1">
                    ({statistics.paidMembers}/{statistics.totalMembers} thành
                    viên)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-purple-500/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statistics.completionRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-linear-to-r from-purple-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Weekly Trends Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-foreground">
                  Thu quỹ 4 tuần gần nhất
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Đã duyệt (VNĐ)
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.weeklyTrends} barCategoryGap="20%">
                  <XAxis
                    dataKey="shortWeek"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(1)}M`
                        : value >= 1000
                          ? `${(value / 1000).toFixed(0)}K`
                          : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()}đ`,
                      'Đã thu',
                    ]}
                    labelFormatter={(label) =>
                      `Tuần ${String(label).replace('T', '')}`
                    }
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {statistics.weeklyTrends.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.section>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên thành viên..."
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
          </div>

          {/* Department Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={selectedDepartment === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDepartment('ALL')}
              className={`h-12 px-4 rounded-xl shrink-0 ${
                selectedDepartment === 'ALL'
                  ? 'bg-purple-600 hover:bg-purple-500'
                  : 'border-border'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Tất cả
            </Button>
            {(Object.keys(departmentNames) as Department[]).map((dept) => {
              const DeptIcon = departmentIcons[dept];
              const isActive = selectedDepartment === dept;
              return (
                <Button
                  key={dept}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`h-12 px-4 rounded-xl shrink-0 ${
                    isActive
                      ? `bg-linear-to-r ${departmentColors[dept]}`
                      : 'border-border'
                  }`}
                >
                  <DeptIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {departmentNames[dept]}
                  </span>
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Queue Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Inbox className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Tổng chờ</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {contributions.length}
            </p>
          </div>
          {(Object.keys(departmentNames) as Department[]).map((dept) => {
            const count = contributions.filter(
              (c) => c.member.department === dept,
            ).length;
            const DeptIcon = departmentIcons[dept];
            return (
              <div
                key={dept}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <DeptIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {departmentNames[dept]}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">{count}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Review Queue */}
        {filteredContributions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {contributions.length === 0 ? (
              /* All Caught Up - Artistic Empty State */
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-48 h-48 rounded-full border border-dashed border-purple-500/20"
                  />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-2 -left-6"
                >
                  <Music className="w-5 h-5 text-pink-400" />
                </motion.div>

                {/* Main illustration */}
                <div className="relative z-10 w-32 h-32 rounded-full bg-linear-to-br from-emerald-500/30 to-purple-500/30 flex items-center justify-center mb-6 mx-auto border border-emerald-500/30">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center"
                  >
                    <PartyPopper className="w-12 h-12 text-emerald-400 mb-1" />
                    <Coffee className="w-6 h-6 text-amber-400" />
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-foreground mb-2"
                >
                  All caught up! ✨
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground max-w-sm mx-auto mb-4"
                >
                  Không còn đóng góp nào chờ duyệt. Thư giãn và uống tách cà phê
                  thôi! ☕
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 text-sm text-purple-400"
                >
                  <Palette className="w-4 h-4" />
                  <span>Art Club Fund Manager</span>
                </motion.div>
              </div>
            ) : (
              /* Search Not Found */
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Không tìm thấy kết quả
                </h2>
                <p className="text-muted-foreground">
                  Thử tìm kiếm với từ khóa khác hoặc bỏ filter
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('ALL');
                  }}
                  className="mt-4"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredContributions.map((contribution) => {
                const DeptIcon =
                  departmentIcons[contribution.member.department];
                const isProcessing = processingId === contribution.id;

                return (
                  <motion.div
                    key={contribution.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="p-4 rounded-2xl bg-card border border-border hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openImageDialog(contribution.imageUrl)}
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
          </motion.div>
        )}
          </>
        ) : (
          /* Payment Matrix View */
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Matrix Header */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-purple-400" />
                  Ma trận thanh toán
                </h2>
                <p className="text-sm text-muted-foreground">
                  {matrixData.members.length} thành viên • 12 tuần gần nhất
                </p>
              </div>
              {/* Search in matrix */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={matrixSearchQuery}
                  onChange={(e) => setMatrixSearchQuery(e.target.value)}
                  placeholder="Tìm thành viên..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border focus:border-purple-500 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-muted-foreground">Đã duyệt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-muted-foreground">Chờ duyệt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-muted-foreground">Chưa nộp</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="sticky left-0 z-10 bg-muted/95 backdrop-blur-sm px-4 py-3 text-left font-semibold text-foreground min-w-[200px]">
                        Thành viên
                      </th>
                      {matrixData.weeks.map((week) => (
                        <th
                          key={week}
                          className={`px-2 py-3 text-center font-medium text-xs whitespace-nowrap min-w-[60px] ${
                            week === matrixData.currentWeek
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {week.replace('Tuần ', 'T')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrixMembers.map((member, idx) => {
                      const DeptIcon = departmentIcons[member.department];
                      return (
                        <tr
                          key={member.id}
                          className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                            idx % 2 === 0 ? '' : 'bg-muted/10'
                          }`}
                        >
                          {/* Member info - sticky column */}
                          <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm px-4 py-2 border-r border-border/50">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg bg-linear-to-br ${departmentColors[member.department]} flex items-center justify-center`}
                              >
                                <DeptIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate max-w-[140px]">
                                  {member.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {departmentNames[member.department]}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Week cells */}
                          {matrixData.weeks.map((week) => {
                            const key = `${member.id}-${week}`;
                            const contribution = contributionMap.get(key);
                            const isCurrentWeek = week === matrixData.currentWeek;

                            return (
                              <td
                                key={week}
                                className={`px-2 py-2 text-center ${
                                  isCurrentWeek ? 'bg-purple-500/5' : ''
                                }`}
                              >
                                {contribution ? (
                                  contribution.status === 'APPROVED' ? (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center cursor-default"
                                      title={`${contribution.amount.toLocaleString()}đ - Đã duyệt`}
                                    >
                                      <Check className="w-4 h-4 text-emerald-400" />
                                    </motion.div>
                                  ) : contribution.status === 'PENDING' ? (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setSelectedPendingCell(contribution);
                                        openImageDialog(contribution.imageUrl);
                                      }}
                                      className="w-8 h-8 mx-auto rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center cursor-pointer hover:bg-amber-500/30 transition-colors"
                                      title={`${contribution.amount.toLocaleString()}đ - Click để xem & duyệt`}
                                    >
                                      <Clock className="w-4 h-4 text-amber-400" />
                                    </motion.button>
                                  ) : (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className="w-8 h-8 mx-auto rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center cursor-default"
                                      title="Bị từ chối"
                                    >
                                      <XCircle className="w-4 h-4 text-red-400" />
                                    </motion.div>
                                  )
                                ) : (
                                  <div
                                    className="w-8 h-8 mx-auto rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center"
                                    title="Chưa nộp"
                                  >
                                    <CircleDashed className="w-4 h-4 text-red-400/50" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty state for filtered */}
              {filteredMatrixMembers.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Không tìm thấy thành viên nào
                  </p>
                </div>
              )}
            </div>

            {/* Quick approve drawer for pending cells */}
            {selectedPendingCell && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-lg"
                >
                  <span className="text-sm text-muted-foreground">
                    {selectedPendingCell.amount.toLocaleString()}đ -{' '}
                    {selectedPendingCell.week}
                  </span>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const result = await approveContribution(
                        selectedPendingCell.id,
                      );
                      if (result.success) {
                        toast.success(result.message);
                        setSelectedPendingCell(null);
                        closeImageDialog();
                        // Refresh page to update matrix
                        window.location.reload();
                      } else {
                        toast.error(result.error);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Duyệt ngay
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPendingCell(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.section>
        )}
      </main>

      {/* Image Dialog with Zoom & Download */}
      <Dialog
        open={imageDialogOpen}
        onOpenChange={(open) => !open && closeImageDialog()}
      >
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black/95 border-white/10 overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-linear-to-b from-black/80 to-transparent">
            <DialogTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Xem hóa đơn
              </span>
              <span className="text-sm font-normal text-white/60">
                {Math.round(zoomLevel * 100)}%
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Image Container */}
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4 pt-16 pb-20">
            {selectedImage && (
              <motion.img
                src={selectedImage}
                alt="Receipt"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 ease-out"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                drag={zoomLevel > 1}
                dragConstraints={{
                  left: -200,
                  right: 200,
                  top: -200,
                  bottom: 200,
                }}
              />
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="h-10 w-10 text-white hover:bg-white/20 rounded-lg"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={resetZoom}
                  className="h-10 w-10 text-white hover:bg-white/20 rounded-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3}
                  className="h-10 w-10 text-white hover:bg-white/20 rounded-lg"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
              </div>

              {/* Download Button */}
              <Button
                onClick={downloadImage}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2"
              >
                <Download className="w-5 h-5" />
                Tải xuống
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Nuclear Option Drawer */}
      <Drawer open={nuclearDrawerOpen} onOpenChange={setNuclearDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-orange-500">
              <Zap className="w-6 h-6" />
              Nuclear Option ☢️
            </DrawerTitle>
            <DrawerDescription>
              Gửi email nhắc nhở đến TẤT CẢ thành viên chưa nộp quỹ tuần này
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4">
            {/* Warning box */}
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-400 mb-1">
                    Cảnh báo!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Action này sẽ gửi email đến{' '}
                    <strong className="text-orange-400">{unpaidCount}</strong>{' '}
                    thành viên chưa nộp quỹ. Hãy chắc chắn trước khi nhấn nút!
                  </p>
                </div>
              </div>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Mail className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {unpaidCount}
                </p>
                <p className="text-xs text-muted-foreground">Email sẽ gửi</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Send className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  ~{Math.ceil(unpaidCount * 0.1)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  Thời gian ước tính
                </p>
              </div>
            </div>

            {/* Email preview hint */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-400 text-center">
                📧 Email sẽ bao gồm: Tên thành viên, Bộ môn, Tuần hiện tại, và
                thông tin chuyển khoản
              </p>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleNuclearOption}
              disabled={isSendingEmails || unpaidCount === 0}
              className="w-full h-14 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-500/25"
            >
              {isSendingEmails ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Đang gửi email...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-2" />
                  Kích hoạt Nuclear ☢️
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                disabled={isSendingEmails}
              >
                Hủy bỏ
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
