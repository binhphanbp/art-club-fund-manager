import * as XLSX from 'xlsx';
import { Contribution, User, Department, ContributionStatus } from '@prisma/client';

type ContributionWithMember = Contribution & {
  member: User;
};

const departmentNames: Record<Department, string> = {
  SINGING: 'Ca hát',
  DANCE: 'Nhảy',
  RAP: 'Rap',
  INSTRUMENT: 'Nhạc cụ',
};

const statusNames: Record<ContributionStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vnd(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fmtDatetime(d: Date) {
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Apply a header style object to a range of cells
function styleHeader(ws: XLSX.WorkSheet, rangeStr: string) {
  const range = XLSX.utils.decode_range(rangeStr);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: C });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '7C3AED' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '5B21B6' } },
        bottom: { style: 'thin', color: { rgb: '5B21B6' } },
        left: { style: 'thin', color: { rgb: '5B21B6' } },
        right: { style: 'thin', color: { rgb: '5B21B6' } },
      },
    };
  }
}

function styleDataRow(ws: XLSX.WorkSheet, rowIndex: number, colCount: number, isEven: boolean) {
  for (let C = 0; C < colCount; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: C });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      fill: { fgColor: { rgb: isEven ? 'F5F3FF' : 'FFFFFF' } },
      border: {
        top: { style: 'thin', color: { rgb: 'DDD6FE' } },
        bottom: { style: 'thin', color: { rgb: 'DDD6FE' } },
        left: { style: 'thin', color: { rgb: 'DDD6FE' } },
        right: { style: 'thin', color: { rgb: 'DDD6FE' } },
      },
      alignment: { vertical: 'center' },
    };
  }
}

// ─── Sheet 1: Detailed Logs ───────────────────────────────────────────────────

function buildDetailSheet(contributions: ContributionWithMember[]): XLSX.WorkSheet {
  // Title row
  const titleRow = ['BÁO CÁO CHI TIẾT ĐÓNG QUỸ - CLB NGHỆ THUẬT'];
  const subRow = [`Ngày xuất: ${fmtDatetime(new Date())}  |  Tổng bản ghi: ${contributions.length}`];
  const blankRow: string[] = [];
  const headers = [
    'STT', 'Họ và Tên', 'Email', 'Bộ môn', 'Tuần', 'Ngày nộp', 'Số tiền', 'Trạng thái', 'Khoá sổ',
  ];

  const rows: any[][] = [titleRow, subRow, blankRow, headers];

  contributions.forEach((c, i) => {
    rows.push([
      i + 1,
      c.member.fullName,
      c.member.email,
      departmentNames[c.member.department],
      c.week,
      fmtDatetime(c.createdAt),
      c.amount,
      statusNames[c.status],
      c.isLocked ? 'Đã khoá' : 'Mở',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 5 },  // STT
    { wch: 26 }, // Họ tên
    { wch: 30 }, // Email
    { wch: 12 }, // Bộ môn
    { wch: 10 }, // Tuần
    { wch: 20 }, // Ngày nộp
    { wch: 14 }, // Số tiền
    { wch: 12 }, // Trạng thái
    { wch: 10 }, // Khoá sổ
  ];

  // Row heights
  ws['!rows'] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 6 }, { hpt: 22 }];

  // Merge title across all columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];

  // Title style
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 14, color: { rgb: '7C3AED' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
  if (ws['A2']) {
    ws['A2'].s = {
      font: { sz: 10, italic: true, color: { rgb: '6B7280' } },
      alignment: { horizontal: 'center' },
    };
  }

  // Header row (row index 3)
  styleHeader(ws, `A4:I4`);

  // Data rows
  contributions.forEach((_, i) => {
    styleDataRow(ws, 4 + i, 9, i % 2 === 0);
  });

  return ws;
}

// ─── Sheet 2: Monthly Summary ─────────────────────────────────────────────────

function buildMonthlySummarySheet(contributions: ContributionWithMember[]): XLSX.WorkSheet {
  const approved = contributions.filter((c) => c.status === 'APPROVED');

  // Group by month+year
  const monthMap = new Map<string, { month: number; year: number; total: number; count: number }>();
  approved.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthMap.get(key) ?? { month: d.getMonth() + 1, year: d.getFullYear(), total: 0, count: 0 };
    entry.total += c.amount;
    entry.count += 1;
    monthMap.set(key, entry);
  });
  const monthRows = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  // Department totals
  const deptRows = (Object.keys(departmentNames) as Department[]).map((dept) => {
    const deptApproved = approved.filter((c) => c.member.department === dept);
    return {
      dept,
      total: deptApproved.reduce((s, c) => s + c.amount, 0),
      count: deptApproved.length,
    };
  });

  const totalApproved = approved.reduce((s, c) => s + c.amount, 0);
  const totalPending = contributions.filter((c) => c.status === 'PENDING').reduce((s, c) => s + c.amount, 0);
  const totalRejected = contributions.filter((c) => c.status === 'REJECTED').length;

  const rows: any[][] = [
    ['TỔNG HỢP HÀNG THÁNG - CLB NGHỆ THUẬT'],
    [`Ngày xuất: ${fmtDate(new Date())}`],
    [],
    // ── Overview block
    ['TỔNG QUAN', '', ''],
    ['Chỉ tiêu', 'Số lượng', 'Số tiền'],
    ['Tổng đóng góp (tất cả)', contributions.length, vnd(contributions.reduce((s, c) => s + c.amount, 0))],
    ['Đã duyệt', approved.length, vnd(totalApproved)],
    ['Chờ duyệt', contributions.filter((c) => c.status === 'PENDING').length, vnd(totalPending)],
    ['Bị từ chối', totalRejected, '-'],
    [],
    // ── Monthly block
    ['THEO THÁNG', '', ''],
    ['Tháng', 'Số lần đóng', 'Số tiền thu'],
    ...monthRows.map((r) => [
      `Tháng ${r.month}/${r.year}`,
      r.count,
      vnd(r.total),
    ]),
    [],
    // ── Department block
    ['THEO BỘ MÔN', '', ''],
    ['Bộ môn', 'Số lần đóng', 'Tổng thu'],
    ...deptRows.map((r) => [departmentNames[r.dept], r.count, vnd(r.total)]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 20 }];

  // Merges for section titles
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 2 } },
    { s: { r: 11 + monthRows.length + 1, c: 0 }, e: { r: 11 + monthRows.length + 1, c: 2 } },
  ];

  // Title
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 14, color: { rgb: '7C3AED' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Section header rows style helper
  const sectionHeaderRows = [3, 10, 11 + monthRows.length + 1];
  sectionHeaderRows.forEach((r) => {
    const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '5B21B6' } },
        alignment: { horizontal: 'center' },
      };
    }
  });

  // Column headers (rows 4, 11, 12+monthRows+2)
  const colHeaderRows = [4, 11, 12 + monthRows.length + 1];
  colHeaderRows.forEach((r) => {
    styleHeader(ws, `${XLSX.utils.encode_cell({ r, c: 0 })}:${XLSX.utils.encode_cell({ r, c: 2 })}`);
  });

  return ws;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateContributionsExcel(contributions: ContributionWithMember[]): Buffer {
  const workbook = XLSX.utils.book_new();

  const detailSheet = buildDetailSheet(contributions);
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết');

  const summarySheet = buildMonthlySummarySheet(contributions);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng hợp tháng');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
}

export function generateExcelFilename(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `BaoCao_Quy_CLB_NgheThuat_T${month}_${year}.xlsx`;
}



