#!/usr/bin/env node

/**
 * Script to help fix Supabase environment variables
 * Run: node scripts/fix-supabase-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔧 Fix Supabase Environment Variables\n');
console.log(
  '⚠️  Phát hiện: NEXT_PUBLIC_SUPABASE_ANON_KEY có vẻ không đúng format',
);
console.log(
  '    Hiện tại: sb_publishable_... (đây là Resend key, không phải Supabase key)\n',
);
console.log('📍 Cách lấy đúng Supabase Anon Key:');
console.log(
  '    1. Truy cập: https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/settings/api',
);
console.log('    2. Copy key "anon/public" (bắt đầu bằng "eyJhbGc...")\n');

rl.question('Bạn đã có Supabase Anon Key chưa? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('\n📖 Hướng dẫn:');
    console.log('    1. Mở link trên trong browser');
    console.log('    2. Login vào Supabase');
    console.log('    3. Copy "anon public" key');
    console.log('    4. Chạy lại script này\n');
    rl.close();
    process.exit(0);
  }

  rl.question('\nPaste Supabase Anon Key vào đây: ', (anonKey) => {
    if (!anonKey || !anonKey.startsWith('eyJ')) {
      console.log('\n❌ Key không hợp lệ! Key phải bắt đầu bằng "eyJ"');
      rl.close();
      process.exit(1);
    }

    // Read current .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the key
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    );

    // Write back
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Đã cập nhật .env file!');
    console.log('\n📝 Các bước tiếp theo:');
    console.log('    1. Tạo Storage bucket "receipts" trên Supabase');
    console.log(
      '       → https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets',
    );
    console.log(
      '    2. Setup Storage Policies (xem SUPABASE_STORAGE_SETUP.md)',
    );
    console.log('    3. Restart dev server: npm run dev');
    console.log('    4. Test upload!\n');

    rl.close();
  });
});
