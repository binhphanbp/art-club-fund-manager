#!/usr/bin/env node

/**
 * Nuclear Fix - Xóa toàn bộ và cài lại từ đầu
 * Run: node scripts/nuclear-fix.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n💣 NUCLEAR FIX - Xóa và cài lại toàn bộ\n');
console.log(
  '⚠️  Cảnh báo: Script này sẽ xóa node_modules và cài lại tất cả!\n',
);

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Bạn có chắc muốn tiếp tục? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Đã hủy.');
    rl.close();
    process.exit(0);
  }

  rl.close();

  try {
    // Step 1: Remove node_modules
    console.log('\n1️⃣  Xóa node_modules...');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('   Đang xóa... (có thể mất vài phút)');
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('   ✅ Đã xóa node_modules');
    }

    // Step 2: Remove package-lock.json
    console.log('\n2️⃣  Xóa package-lock.json...');
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log('   ✅ Đã xóa package-lock.json');
    }

    // Step 3: Clean npm cache
    console.log('\n3️⃣  Dọn dẹp npm cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('   ✅ Cache đã được dọn dẹp');

    // Step 4: Install all packages
    console.log('\n4️⃣  Cài đặt lại tất cả packages...');
    console.log('   (Có thể mất 2-5 phút, vui lòng đợi...)');
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Đã cài đặt tất cả packages');

    // Step 5: Generate Prisma Client
    console.log('\n5️⃣  Generate Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('   ✅ Prisma Client đã được generate');

    // Success
    console.log('\n' + '='.repeat(60));
    console.log('✅ HOÀN THÀNH!');
    console.log('='.repeat(60));
    console.log('\n📝 Các bước tiếp theo:');
    console.log('   1. Chạy: npm run dev');
    console.log('   2. Test upload!\n');
  } catch (error) {
    console.error('\n❌ Có lỗi xảy ra:', error.message);
    process.exit(1);
  }
});
