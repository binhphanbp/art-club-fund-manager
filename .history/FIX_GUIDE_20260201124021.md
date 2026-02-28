# 🚀 Hướng dẫn Fix Toàn bộ - Art Club Fund Manager

## 📋 Tổng quan vấn đề:

1. ❌ **Số tiền sai**: Đang là 50,000đ, cần đổi thành 20,000đ
2. ❌ **Upload lỗi**: Supabase Storage chưa được setup đúng
3. ❌ **Supabase Key sai**: Đang dùng Resend key thay vì Supabase key

---

## ✅ Giải pháp (Làm theo thứ tự):

### 🔥 BƯỚC 1: Fix Supabase Key & Storage (QUAN TRỌNG NHẤT!)

#### 1.1. Lấy đúng Supabase Anon Key

**Cách 1: Tự động (Khuyến nghị)**

```bash
node scripts/fix-supabase-env.js
```

**Cách 2: Thủ công**

1. Truy cập: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/settings/api
2. Copy key **"anon public"** (bắt đầu bằng `eyJhbGc...`)
3. Mở file `.env`
4. Thay thế dòng:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (paste key mới vào đây)
   ```

#### 1.2. Tạo Storage Bucket "receipts"

1. Truy cập: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets
2. Click **"New bucket"**
3. Điền:
   - **Name**: `receipts`
   - **Public bucket**: ✅ **BẬT**
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/*`
4. Click **"Create bucket"**

#### 1.3. Setup Storage Policies

Vào bucket "receipts" → Tab **"Policies"** → **"New Policy"**

**Policy 1: Upload**

```sql
-- Name: Allow authenticated users to upload
-- Operation: INSERT
-- Policy:
(auth.role() = 'authenticated')
```

**Policy 2: Read**

```sql
-- Name: Allow public read access
-- Operation: SELECT
-- Policy:
true
```

📖 **Chi tiết**: Xem file `SUPABASE_STORAGE_SETUP.md`

---

### 💰 BƯỚC 2: Update Database (50,000đ → 20,000đ)

#### 2.1. Chạy Script Tự động (Khuyến nghị)

```bash
node scripts/update-to-20k.js
```

#### 2.2. Hoặc Chạy Thủ công

```bash
# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

📖 **Chi tiết**: Xem file `UPDATE_DATABASE.md`

---

### 🔄 BƯỚC 3: Restart Dev Server

```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

---

### 🧪 BƯỚC 4: Test Everything

#### 4.1. Test Upload

1. Login vào app
2. Vào Dashboard
3. Click **"Nộp Quỹ Tuần X"**
4. Kiểm tra hiển thị **"20.000đ"** ✅
5. Chọn ảnh và upload
6. Kiểm tra không còn lỗi ✅

#### 4.2. Test Admin Panel

1. Vào `/admin`
2. Kiểm tra contributions hiển thị đúng số tiền
3. Test approve/reject

#### 4.3. Test Super Admin

1. Vào `/super-admin`
2. Click **"Cài đặt CLB"**
3. Kiểm tra "Số tiền quỹ/tuần" = **20,000đ**
4. Update nếu cần

---

## 📊 Checklist Hoàn thành:

### Code Changes (✅ Đã xong)

- [x] Schema: Default amount = 20000
- [x] Upload Form: Hiển thị 20.000đ
- [x] Dashboard: Tính toán với 20.000đ
- [x] Actions: Default 20000
- [x] API: Default 20000
- [x] Email: Hiển thị 20.000đ
- [x] Super Admin: Default 20000
- [x] Seed: Test data với 20000

### Setup Tasks (❗ Cần làm)

- [ ] Fix Supabase Anon Key
- [ ] Tạo Storage bucket "receipts"
- [ ] Setup Storage Policies
- [ ] Push database schema
- [ ] Generate Prisma Client
- [ ] Restart dev server
- [ ] Test upload thành công

---

## 🔍 Troubleshooting:

### Lỗi: "Invalid API key"

→ Chưa update đúng NEXT_PUBLIC_SUPABASE_ANON_KEY
→ Chạy lại Bước 1.1

### Lỗi: "Bucket not found"

→ Chưa tạo bucket "receipts"
→ Làm lại Bước 1.2

### Lỗi: "Permission denied"

→ Chưa setup Storage Policies
→ Làm lại Bước 1.3

### Upload vẫn hiển thị 50,000đ

→ Chưa restart dev server
→ Ctrl+C và chạy lại `npm run dev`

---

## 📁 Files đã tạo:

| File                                           | Mục đích                        |
| ---------------------------------------------- | ------------------------------- |
| `FIX_GUIDE.md`                                 | Hướng dẫn tổng hợp (file này)   |
| `SUPABASE_STORAGE_SETUP.md`                    | Chi tiết setup Supabase Storage |
| `UPDATE_DATABASE.md`                           | Chi tiết update database        |
| `scripts/fix-supabase-env.js`                  | Script tự động fix .env         |
| `scripts/update-to-20k.js`                     | Script tự động update DB        |
| `prisma/migrations/update_amount_to_20000.sql` | SQL migration                   |

---

## 🎯 Quick Start (TL;DR):

```bash
# 1. Fix Supabase key
node scripts/fix-supabase-env.js

# 2. Tạo bucket "receipts" trên Supabase Dashboard (thủ công)
#    → https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets

# 3. Setup Storage Policies (thủ công, xem SUPABASE_STORAGE_SETUP.md)

# 4. Update database
node scripts/update-to-20k.js

# 5. Restart server
npm run dev

# 6. Test upload!
```

---

## 💡 Lưu ý:

- ⚠️ **Không commit file `.env`** vào Git (đã có trong .gitignore)
- ✅ **Data cũ giữ nguyên** - Chỉ áp dụng 20,000đ cho contributions mới
- 🔒 **Storage bucket phải PUBLIC** để lấy được public URL
- 🔑 **Policies phải cho phép authenticated users upload**

---

## 🆘 Cần trợ giúp?

1. Kiểm tra Console Log (F12 → Console) khi upload
2. Kiểm tra Network Tab để xem request/response
3. Xem file `SUPABASE_STORAGE_SETUP.md` để debug chi tiết
4. Đảm bảo đã làm đủ 3 bước: Key + Bucket + Policies

---

**Good luck! 🚀**
