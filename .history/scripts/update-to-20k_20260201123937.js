#!/usr/bin/env node

/**
 * Script to update database from 50,000đ to 20,000đ
 * Run: node scripts/update-to-20k.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔄 Cập nhật Database: 50,000đ → 20,000đ\n');
console.log('Các thay đổi sẽ được thực hiện:');
console.log('  ✅ Schema default amount: 20000');
console.log('  ✅ Settings weeklyFundAmount: 20000');
console.log('  ⚠️  Data cũ GIỮ NGUYÊN (không thay đổi)\n');

rl.question('Bạn có muốn tiếp tục? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Đã hủy.');
    rl.close();
    process.exit(0);
  }

  console.log('\n📦 Bước 1: Pushing schema changes...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schema updated!\n');
  } catch (error) {
    console.error('❌ Lỗi khi push schema:', error.message);
    rl.close();
    process.exit(1);
  }

  console.log('🔧 Bước 2: Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated!\n');
  } catch (error) {
    console.error('❌ Lỗi khi generate client:', error.message);
    rl.close();
    process.exit(1);
  }

  console.log('✨ Hoàn thành!\n');
  console.log('📝 Các bước tiếp theo:');
  console.log('  1. Restart dev server: npm run dev');
  console.log('  2. Vào /super-admin để update Settings (nếu cần)');
  console.log('  3. Test upload với số tiền mới: 20,000đ\n');

  rl.close();
});
