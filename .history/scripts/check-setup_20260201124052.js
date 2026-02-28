#!/usr/bin/env node

/**
 * Script to check if everything is setup correctly
 * Run: node scripts/check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Kiểm tra Setup - Art Club Fund Manager\n');

let allGood = true;

// Check 1: .env file
console.log('1️⃣  Checking .env file...');
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ File .env không tồn tại!');
  allGood = false;
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check Supabase URL
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://')) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL: OK');
  } else {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL: Missing or invalid');
    allGood = false;
  }

  // Check Supabase Anon Key
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ')) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: OK (starts with eyJ)');
  } else if (
    envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_')
  ) {
    console.log(
      '   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: WRONG! (This is Resend key)',
    );
    console.log('      → Run: node scripts/fix-supabase-env.js');
    allGood = false;
  } else {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing or invalid');
    allGood = false;
  }

  // Check Database URL
  if (envContent.includes('DATABASE_URL=')) {
    console.log('   ✅ DATABASE_URL: OK');
  } else {
    console.log('   ❌ DATABASE_URL: Missing');
    allGood = false;
  }

  // Check Resend API Key
  if (envContent.includes('RESEND_API_KEY=re_')) {
    console.log('   ✅ RESEND_API_KEY: OK');
  } else {
    console.log('   ⚠️  RESEND_API_KEY: Missing (optional for emails)');
  }
}

// Check 2: Prisma Schema
console.log('\n2️⃣  Checking Prisma Schema...');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.log('   ❌ prisma/schema.prisma không tồn tại!');
  allGood = false;
} else {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Check Contribution amount default
  if (schemaContent.includes('amount    Int                @default(20000)')) {
    console.log('   ✅ Contribution.amount default: 20000');
  } else if (
    schemaContent.includes('amount    Int                @default(50000)')
  ) {
    console.log('   ❌ Contribution.amount default: Still 50000!');
    console.log('      → Run: node scripts/update-to-20k.js');
    allGood = false;
  } else {
    console.log('   ⚠️  Contribution.amount: Cannot verify');
  }

  // Check Settings weeklyFundAmount default
  if (schemaContent.includes('weeklyFundAmount Int      @default(20000)')) {
    console.log('   ✅ Settings.weeklyFundAmount default: 20000');
  } else if (
    schemaContent.includes('weeklyFundAmount Int      @default(50000)')
  ) {
    console.log('   ❌ Settings.weeklyFundAmount default: Still 50000!');
    console.log('      → Run: node scripts/update-to-20k.js');
    allGood = false;
  } else {
    console.log('   ⚠️  Settings.weeklyFundAmount: Cannot verify');
  }
}

// Check 3: Upload Form Component
console.log('\n3️⃣  Checking Upload Form...');
const uploadFormPath = path.join(
  process.cwd(),
  'components',
  'upload-fund-form.tsx',
);
if (!fs.existsSync(uploadFormPath)) {
  console.log('   ❌ components/upload-fund-form.tsx không tồn tại!');
  allGood = false;
} else {
  const formContent = fs.readFileSync(uploadFormPath, 'utf8');

  if (formContent.includes('amount: 20000')) {
    console.log('   ✅ Upload form amount: 20000');
  } else if (formContent.includes('amount: 50000')) {
    console.log('   ❌ Upload form amount: Still 50000!');
    allGood = false;
  }

  if (formContent.includes('20.000đ')) {
    console.log('   ✅ Upload form display: 20.000đ');
  } else if (formContent.includes('50.000đ')) {
    console.log('   ❌ Upload form display: Still 50.000đ!');
    allGood = false;
  }
}

// Check 4: Node modules
console.log('\n4️⃣  Checking Dependencies...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('   ❌ node_modules không tồn tại!');
  console.log('      → Run: npm install');
  allGood = false;
} else {
  console.log('   ✅ node_modules: OK');

  // Check important packages
  const packages = [
    '@supabase/ssr',
    '@supabase/supabase-js',
    '@prisma/client',
    'xlsx',
    'framer-motion',
    'recharts',
  ];

  packages.forEach((pkg) => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`   ✅ ${pkg}: Installed`);
    } else {
      console.log(`   ❌ ${pkg}: Missing`);
      allGood = false;
    }
  });
}

// Check 5: Prisma Client
console.log('\n5️⃣  Checking Prisma Client...');
const prismaClientPath = path.join(
  process.cwd(),
  'node_modules',
  '.prisma',
  'client',
);
if (!fs.existsSync(prismaClientPath)) {
  console.log('   ❌ Prisma Client chưa được generate!');
  console.log('      → Run: npx prisma generate');
  allGood = false;
} else {
  console.log('   ✅ Prisma Client: Generated');
}

// Summary
console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ TẤT CẢ ĐỀU OK! Bạn có thể chạy app ngay.');
  console.log('\n📝 Các bước tiếp theo:');
  console.log('   1. Tạo Storage bucket "receipts" trên Supabase (nếu chưa)');
  console.log(
    '      → https://supabase.com/dashboard/project/iuursifaetkutagxwyrh/storage/buckets',
  );
  console.log('   2. Setup Storage Policies (xem SUPABASE_STORAGE_SETUP.md)');
  console.log('   3. Run: npm run dev');
  console.log('   4. Test upload!\n');
} else {
  console.log('❌ CÓ VẤN ĐỀ CẦN FIX!');
  console.log('\n📖 Xem hướng dẫn chi tiết:');
  console.log('   → FIX_GUIDE.md');
  console.log('\n🔧 Quick fix:');
  console.log('   1. node scripts/fix-supabase-env.js');
  console.log('   2. node scripts/update-to-20k.js');
  console.log('   3. npm install (nếu thiếu packages)');
  console.log('   4. npx prisma generate (nếu thiếu Prisma Client)\n');
}
console.log('='.repeat(60) + '\n');
