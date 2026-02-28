# 🔧 Hướng dẫn Fix Lỗi Upload Ảnh

## ❌ Vấn đề hiện tại:

1. **Supabase Anon Key sai** - Đang dùng Resend key thay vì Supabase key
2. **Storage bucket chưa được setup** - Cần tạo bucket "receipts" trên Supabase

---

## ✅ Cách Fix:

### Bước 1: Lấy đúng Supabase Keys

1. Truy cập: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/settings/api
2. Copy 2 keys sau:
   - **Project URL** (đã đúng rồi)
   - **anon/public key** (key dài bắt đầu bằng `eyJhbGc...`)

3. Cập nhật file `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iuursifaetkutagxwyrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (paste key thật vào đây)
```

### Bước 2: Tạo Storage Bucket "receipts"

1. Truy cập: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets
2. Click **"New bucket"**
3. Điền thông tin:
   - **Name**: `receipts`
   - **Public bucket**: ✅ **BẬT** (để lấy public URL)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/*`

4. Click **"Create bucket"**

### Bước 3: Setup Storage Policies (Quyền truy cập)

Sau khi tạo bucket, cần setup policies:

1. Vào bucket "receipts" → Tab **"Policies"**
2. Click **"New Policy"** → **"For full customization"**

**Policy 1: Upload (INSERT)**

```sql
-- Name: Allow authenticated users to upload
-- Operation: INSERT
-- Policy:
(auth.role() = 'authenticated')
```

**Policy 2: Read (SELECT)**

```sql
-- Name: Allow public read access
-- Operation: SELECT
-- Policy:
true
```

**Policy 3: Delete (DELETE)** - Optional, cho admin xóa ảnh

```sql
-- Name: Allow users to delete their own files
-- Operation: DELETE
-- Policy:
(auth.uid()::text = (storage.foldername(name))[1])
```

### Bước 4: Restart Dev Server

```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

---

## 🧪 Test Upload

1. Login vào app
2. Click "Nộp Quỹ Tuần X"
3. Chọn ảnh
4. Click "Gửi xác nhận"
5. Kiểm tra console nếu vẫn lỗi

---

## 🔍 Debug nếu vẫn lỗi:

### Kiểm tra Console Log:

- Mở DevTools (F12) → Tab Console
- Xem lỗi chi tiết khi upload

### Các lỗi thường gặp:

**1. "Invalid API key"**
→ Sai NEXT_PUBLIC_SUPABASE_ANON_KEY

**2. "Bucket not found"**
→ Chưa tạo bucket "receipts"

**3. "Permission denied"**
→ Chưa setup Storage Policies

**4. "File too large"**
→ Ảnh > 10MB (nhưng đã có compression nên ít khi xảy ra)

---

## 📝 Checklist:

- [ ] Đã lấy đúng Supabase Anon Key
- [ ] Đã cập nhật file .env
- [ ] Đã tạo bucket "receipts" (public)
- [ ] Đã setup 2 policies (INSERT + SELECT)
- [ ] Đã restart dev server
- [ ] Test upload thành công

---

## 💡 Lưu ý:

- Bucket phải là **PUBLIC** để lấy được public URL
- Policies phải cho phép **authenticated users upload**
- File sẽ được lưu theo format: `{userId}/W{weekNumber}-{timestamp}.jpg`
- Ảnh tự động nén xuống < 500KB trước khi upload
