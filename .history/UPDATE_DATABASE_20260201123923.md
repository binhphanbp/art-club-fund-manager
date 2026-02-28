# 🔄 Cập nhật Database - Đổi số tiền từ 50,000đ → 20,000đ

## ✅ Đã hoàn thành:

### 1. Code Changes

- ✅ Schema: `prisma/schema.prisma` - Default amount = 20000
- ✅ Upload Form: `components/upload-fund-form.tsx` - Hiển thị 20.000đ
- ✅ Dashboard: `app/dashboard/dashboard-client.tsx` - Tính toán với 20.000đ
- ✅ Actions: `app/actions/contribution.ts` - Default 20000
- ✅ API: `app/api/contributions/route.ts` - Default 20000
- ✅ Email: `emails/reminder-email.tsx` - Hiển thị 20.000đ
- ✅ Super Admin: `app/super-admin/super-admin-client.tsx` - Default 20000
- ✅ Seed: `prisma/seed.ts` - Test data với 20000

---

## 🚀 Các bước thực hiện:

### Bước 1: Push Schema Changes

```bash
npx prisma db push
```

Lệnh này sẽ:

- Cập nhật default value trong database
- Không ảnh hưởng đến data hiện có
- Chỉ áp dụng cho records mới

### Bước 2: Update Settings trong Database (Nếu cần)

**Option A: Qua Super Admin UI** (Khuyến nghị)

1. Login với tài khoản SUPER_ADMIN
2. Vào `/super-admin`
3. Click "Cài đặt CLB"
4. Đổi "Số tiền quỹ/tuần" từ 50,000 → 20,000
5. Click "Lưu cài đặt"

**Option B: Qua SQL** (Nếu muốn update trực tiếp)

```sql
UPDATE "settings"
SET "weeklyFundAmount" = 20000
WHERE "weeklyFundAmount" = 50000;
```

### Bước 3: Regenerate Prisma Client

```bash
npx prisma generate
```

### Bước 4: Restart Dev Server

```bash
# Dừng server (Ctrl+C)
npm run dev
```

---

## 🔍 Kiểm tra sau khi update:

### 1. Dashboard

- [ ] Tổng số tiền hiển thị đúng (số tuần × 20,000đ)
- [ ] Upload form hiển thị "20.000đ"

### 2. Admin Panel

- [ ] Contributions hiển thị đúng số tiền
- [ ] Statistics tính toán đúng

### 3. Super Admin

- [ ] Settings hiển thị 20,000đ
- [ ] Có thể update settings

### 4. Email

- [ ] Email reminder hiển thị "20.000đ"

---

## ⚠️ Lưu ý về Data hiện có:

### Contributions đã tồn tại:

- **KHÔNG tự động update** - Giữ nguyên giá trị cũ (50,000đ)
- Lý do: Đây là dữ liệu lịch sử, không nên thay đổi

### Nếu muốn update ALL contributions:

```sql
-- ⚠️ CẢNH BÁO: Chỉ chạy nếu bạn chắc chắn muốn đổi TẤT CẢ data cũ
UPDATE "contributions"
SET "amount" = 20000
WHERE "amount" = 50000;
```

### Contributions mới:

- Tự động dùng 20,000đ làm default
- Áp dụng từ sau khi push schema

---

## 🧪 Test Checklist:

```bash
# 1. Push schema
npx prisma db push

# 2. Generate client
npx prisma generate

# 3. Restart server
npm run dev

# 4. Test upload
# - Login → Dashboard → "Nộp Quỹ Tuần X"
# - Kiểm tra hiển thị "20.000đ"
# - Upload ảnh test
# - Kiểm tra trong admin panel

# 5. Test admin
# - Vào /admin
# - Kiểm tra số tiền hiển thị đúng
# - Approve/Reject test contribution

# 6. Test super admin
# - Vào /super-admin
# - Kiểm tra settings
# - Update settings nếu cần
```

---

## 📊 Summary:

| Item             | Old Value | New Value | Status     |
| ---------------- | --------- | --------- | ---------- |
| Schema Default   | 50000     | 20000     | ✅ Updated |
| Settings Default | 50000     | 20000     | ✅ Updated |
| Upload Form      | 50.000đ   | 20.000đ   | ✅ Updated |
| Dashboard Calc   | × 50000   | × 20000   | ✅ Updated |
| Email Template   | 50.000đ   | 20.000đ   | ✅ Updated |
| Seed Data        | 50000     | 20000     | ✅ Updated |

---

## 🎯 Next Steps:

1. ✅ Fix Supabase Storage (xem `SUPABASE_STORAGE_SETUP.md`)
2. ✅ Update database schema (chạy commands trên)
3. ✅ Test upload functionality
4. ✅ Verify all pages hiển thị đúng 20,000đ
