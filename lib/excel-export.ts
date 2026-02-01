import * as XLSX from 'xlsx';
import { Contribution, User, Department, ContributionStatus } from '@prisma/client';

// Type for contribution with member
type ContributionWithMember = Contribution & {
  member: User;
};

// Department display names in Vietnamese
const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

// Status display names in Vietnamese
const statusNames: Record<ContributionStatus, string> = {
  PENDING: 'Đang chờ',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

// Generate Excel file from contributions data
export function generateContributionsExcel(
  contributions: ContributionWithMember[],
): Buffer {
  // Transform data into rows
  const data = contributions.map((c) => ({
    'Họ và Tên': c.member.fullName,
    'Email': c.member.email,
    'Bộ phận': departmentNames[c.member.department],
    'Tuần': c.week,
    'Ngày nộp': new Date(c.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    'Số tiền': c.amount,
    'Trạng thái': statusNames[c.status],
    'Ghi chú': c.status === 'REJECTED' ? 'Bị từ chối' : '',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Define column widths (auto-adjust)
  const columnWidths = [
    { wch: 25 }, // Họ và Tên
    { wch: 30 }, // Email
    { wch: 12 }, // Bộ phận
    { wch: 10 }, // Tuần
    { wch: 20 }, // Ngày nộp
    { wch: 15 }, // Số tiền
    { wch: 12 }, // Trạng thái
    { wch: 20 }, // Ghi chú
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row (bold + background color)
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '7C3AED' } }, // Purple background
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Apply header styles (note: xlsx community edition has limited style support)
  // For full styling, xlsx-style or exceljs would be needed
  // Here we'll add basic formatting that works with xlsx

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Đóng góp');

  // Add summary sheet
  const summaryData = createSummaryData(contributions);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng hợp');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

// Create summary data for the second sheet
function createSummaryData(contributions: ContributionWithMember[]) {
  const approvedContributions = contributions.filter(
    (c) => c.status === 'APPROVED',
  );
  const pendingContributions = contributions.filter(
    (c) => c.status === 'PENDING',
  );
  const rejectedContributions = contributions.filter(
    (c) => c.status === 'REJECTED',
  );

  const totalApproved = approvedContributions.reduce(
    (sum, c) => sum + c.amount,
    0,
  );
  const totalPending = pendingContributions.reduce(
    (sum, c) => sum + c.amount,
    0,
  );

  // Count by department
  const departmentStats = Object.keys(departmentNames).map((dept) => {
    const deptContributions = contributions.filter(
      (c) => c.member.department === dept && c.status === 'APPROVED',
    );
    return {
      'Thống kê': `Bộ phận ${departmentNames[dept as Department]}`,
      'Giá trị': `${deptContributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}đ`,
    };
  });

  return [
    { 'Thống kê': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleDateString('vi-VN') },
    { 'Thống kê': '', 'Giá trị': '' },
    { 'Thống kê': 'Tổng số đóng góp', 'Giá trị': contributions.length },
    { 'Thống kê': 'Đã duyệt', 'Giá trị': approvedContributions.length },
    { 'Thống kê': 'Đang chờ', 'Giá trị': pendingContributions.length },
    { 'Thống kê': 'Bị từ chối', 'Giá trị': rejectedContributions.length },
    { 'Thống kê': '', 'Giá trị': '' },
    { 'Thống kê': 'Tổng tiền đã duyệt', 'Giá trị': `${totalApproved.toLocaleString()}đ` },
    { 'Thống kê': 'Tổng tiền chờ duyệt', 'Giá trị': `${totalPending.toLocaleString()}đ` },
    { 'Thống kê': '', 'Giá trị': '' },
    ...departmentStats,
  ];
}

// Generate dynamic filename
export function generateExcelFilename(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `Quy_CLB_NgheThuat_Thang_${month}_${year}.xlsx`;
}
