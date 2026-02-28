# 📝 Changelog - Art Club Fund Manager

## 🔄 Update: 2026-02-01 - Fix Amount & Upload Issues

### ✅ Đã hoàn thành:

#### 1. **Đổi số tiền từ 50,000đ → 20,000đ**

**Files đã update:**

- ✅ `prisma/schema.prisma`
  - Contribution.amount default: 20000
  - Settings.weeklyFundAmount default: 20000

- ✅ `components/upload-fund-form.tsx`
  - Upload amount: 20000
  - Display text: "20.000đ"
  - Description: "Tải lên ảnh chứng minh đã chuyển khoản 20.000đ"

- ✅ `app/dashboard/dashboard-client.tsx`
  - Calculation: totalPaid × 20000

- ✅ `app/actions/contribution.ts`
  - Default amount: 20000

- ✅ `app/api/contributions/route.ts`
  - Default amount: 20000

- ✅ `app/super-admin/super-admin-client.tsx`
  - Settings form default: 20000
  - Display default: 20000

- ✅ `emails/reminder-email.tsx`
  - Display: "20.000đ"

- ✅ `prisma/seed.ts`
  - Test data: 20000

#### 2. **Tạo Scripts & Documentation**

**Scripts tự động:**

- ✅ `scripts/check-setup.js` - Kiểm tra setup
- ✅ `scripts/fix-supabase-env.js` - Fix Supabase key
- ✅ `scripts/update-to-20k.js` - Update database

**NPM Scripts mới:**

```json
{
  "check": "node scripts/check-setup.js",
  "fix:env": "node scripts/fix-supabase-env.js",
  "fix:amount": "node scripts/update-to-20k.js",
  "db:push": "prisma db push",
  "db:generate": "prisma generate",
  "db:seed": "prisma db seed"
}
```

**Documentation:**

- ✅ `FIX_GUIDE.md` - Hướng dẫn tổng hợp
- ✅ `QUICK_FIX.md` - Hướng dẫn nhanh
- ✅ `SUPABASE_STORAGE_SETUP.md` - Setup Supabase Storage
- ✅ `UPDATE_DATABASE.md` - Update database chi tiết
- ✅ `CHANGELOG.md` - File này

**Migration:**

- ✅ `prisma/migrations/update_amount_to_20000.sql` - SQL migration

---

### 🔍 Vấn đề đã phát hiện:

#### 1. **Supabase Anon Key sai**

- ❌ Hiện tại: `sb_publishable_...` (Resend key)
- ✅ Cần: `eyJhbGc...` (Supabase anon key)
- 🔧 Fix: Chạy `npm run fix:env`

#### 2. **Storage bucket chưa tạo**

- ❌ Bucket "receipts" chưa tồn tại
- ✅ Cần: Tạo bucket public trên Supabase Dashboard
- 🔧 Fix: Xem `SUPABASE_STORAGE_SETUP.md`

#### 3. **Storage Policies chưa setup**

- ❌ Chưa có policies cho upload/read
- ✅ Cần: 2 policies (INSERT + SELECT)
- 🔧 Fix: Xem `SUPABASE_STORAGE_SETUP.md`

---

### 📊 Summary:

| Item             | Before         | After       | Status    |
| ---------------- | -------------- | ----------- | --------- |
| Default Amount   | 50,000đ        | 20,000đ     | ✅ Fixed  |
| Upload Display   | 50.000đ        | 20.000đ     | ✅ Fixed  |
| Dashboard Calc   | × 50000        | × 20000     | ✅ Fixed  |
| Email Display    | 50.000đ        | 20.000đ     | ✅ Fixed  |
| Supabase Key     | Wrong (Resend) | Need Fix    | ⚠️ Manual |
| Storage Bucket   | Not Created    | Need Create | ⚠️ Manual |
| Storage Policies | Not Setup      | Need Setup  | ⚠️ Manual |

---

### 🎯 Các bước tiếp theo (User cần làm):

1. **Fix Supabase Key**

   ```bash
   npm run fix:env
   ```

2. **Tạo Storage Bucket** (Thủ công)
   - Vào Supabase Dashboard
   - Tạo bucket "receipts" (public)

3. **Setup Storage Policies** (Thủ công)
   - Policy 1: Allow authenticated upload
   - Policy 2: Allow public read

4. **Update Database**

   ```bash
   npm run fix:amount
   ```

5. **Restart Server**

   ```bash
   npm run dev
   ```

6. **Test Upload**
   - Login → Dashboard → Upload ảnh
   - Kiểm tra không còn lỗi

---

### 🔧 Technical Details:

#### Database Schema Changes:

```prisma
// Before
model Contribution {
  amount Int @default(50000)
}

model Settings {
  weeklyFundAmount Int @default(50000)
}

// After
model Contribution {
  amount Int @default(20000)
}

model Settings {
  weeklyFundAmount Int @default(20000)
}
```

#### Code Changes:

```typescript
// Before
amount: 50000;
totalAmount = totalPaid * 50000;

// After
amount: 20000;
totalAmount = totalPaid * 20000;
```

---

### 📁 File Structure:

```
project/
├── FIX_GUIDE.md                    # Hướng dẫn tổng hợp
├── QUICK_FIX.md                    # Hướng dẫn nhanh
├── SUPABASE_STORAGE_SETUP.md       # Setup Supabase
├── UPDATE_DATABASE.md              # Update DB
├── CHANGELOG.md                    # File này
├── scripts/
│   ├── check-setup.js              # Check setup
│   ├── fix-supabase-env.js         # Fix .env
│   └── update-to-20k.js            # Update DB
├── prisma/
│   ├── schema.prisma               # ✅ Updated
│   ├── seed.ts                     # ✅ Updated
│   └── migrations/
│       └── update_amount_to_20000.sql
├── components/
│   └── upload-fund-form.tsx        # ✅ Updated
├── app/
│   ├── dashboard/
│   │   └── dashboard-client.tsx    # ✅ Updated
│   ├── actions/
│   │   └── contribution.ts         # ✅ Updated
│   ├── api/
│   │   └── contributions/
│   │       └── route.ts            # ✅ Updated
│   └── super-admin/
│       └── super-admin-client.tsx  # ✅ Updated
├── emails/
│   └── reminder-email.tsx          # ✅ Updated
└── package.json                    # ✅ Updated (new scripts)
```

---

### 🎉 Kết quả mong đợi:

Sau khi hoàn thành tất cả các bước:

- ✅ Upload form hiển thị "20.000đ"
- ✅ Dashboard tính toán đúng với 20,000đ
- ✅ Upload ảnh thành công không lỗi
- ✅ Admin panel hiển thị đúng số tiền
- ✅ Email reminder hiển thị "20.000đ"
- ✅ Super Admin settings = 20,000đ

---

### 📞 Support:

Nếu gặp vấn đề:

1. Chạy `npm run check` để kiểm tra
2. Xem `FIX_GUIDE.md` để debug
3. Kiểm tra Console Log (F12) khi upload
4. Đảm bảo đã làm đủ 3 bước Supabase setup

---

**Version:** 1.0.0  
**Date:** 2026-02-01  
**Author:** Kiro AI Assistant  
**Status:** ✅ Code Complete | ⚠️ Manual Setup Required
