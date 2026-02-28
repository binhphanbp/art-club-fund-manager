# ⚡ Quick Fix - Chạy ngay 3 lệnh này!

## 🎯 Mục tiêu:

- ✅ Fix số tiền: 50,000đ → 20,000đ
- ✅ Fix upload lỗi (Supabase Storage)

---

## 🚀 Làm theo thứ tự:

### 1️⃣ Kiểm tra setup hiện tại

```bash
npm run check
```

→ Script sẽ báo bạn thiếu gì

---

### 2️⃣ Fix Supabase Environment Key

```bash
npm run fix:env
```

→ Làm theo hướng dẫn trên màn hình

**Cần làm thêm (THỦ CÔNG):**

1. Tạo bucket "receipts" trên Supabase:
   - Vào: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets
   - Click "New bucket"
   - Name: `receipts`
   - Public: ✅ BẬT
   - Create

2. Setup Policies (2 policies):
   - Vào bucket "receipts" → Policies → New Policy

   **Policy 1 (Upload):**

   ```sql
   (auth.role() = 'authenticated')
   ```

   **Policy 2 (Read):**

   ```sql
   true
   ```

📖 Chi tiết: `SUPABASE_STORAGE_SETUP.md`

---

### 3️⃣ Update Database (50k → 20k)

```bash
npm run fix:amount
```

→ Tự động push schema + generate client

---

### 4️⃣ Restart Server

```bash
npm run dev
```

---

### 5️⃣ Test Upload

1. Login vào app
2. Dashboard → "Nộp Quỹ Tuần X"
3. Kiểm tra hiển thị **20.000đ** ✅
4. Upload ảnh test
5. Không còn lỗi! 🎉

---

## 📋 Checklist:

- [ ] Chạy `npm run check` - Xem thiếu gì
- [ ] Chạy `npm run fix:env` - Fix Supabase key
- [ ] Tạo bucket "receipts" (thủ công)
- [ ] Setup 2 Storage Policies (thủ công)
- [ ] Chạy `npm run fix:amount` - Update DB
- [ ] Chạy `npm run dev` - Restart server
- [ ] Test upload thành công!

---

## 🆘 Nếu vẫn lỗi:

### Lỗi: "Invalid API key"

```bash
# Chạy lại
npm run fix:env
# Paste đúng key từ Supabase Dashboard
```

### Lỗi: "Bucket not found"

```bash
# Tạo bucket "receipts" trên Supabase (thủ công)
# Link: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets
```

### Lỗi: "Permission denied"

```bash
# Setup Storage Policies (thủ công)
# Xem: SUPABASE_STORAGE_SETUP.md
```

### Vẫn hiển thị 50,000đ

```bash
# Restart server
# Ctrl+C rồi chạy lại
npm run dev
```

---

## 📚 Tài liệu chi tiết:

| File                        | Nội dung                        |
| --------------------------- | ------------------------------- |
| `FIX_GUIDE.md`              | Hướng dẫn đầy đủ từng bước      |
| `SUPABASE_STORAGE_SETUP.md` | Chi tiết setup Supabase Storage |
| `UPDATE_DATABASE.md`        | Chi tiết update database        |

---

## 🎯 TL;DR (Quá ngắn gọn):

```bash
# 1. Check
npm run check

# 2. Fix env (paste Supabase key khi được hỏi)
npm run fix:env

# 3. Tạo bucket "receipts" + Setup policies (thủ công trên Supabase Dashboard)

# 4. Update DB
npm run fix:amount

# 5. Run
npm run dev

# 6. Test upload!
```

---

**Done! 🚀**
