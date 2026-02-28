#!/usr/bin/env node

/**
 * Reinstall Prisma Client - Fix EPERM and module errors
 * Run: node scripts/reinstall-prisma.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Reinstalling Prisma Client...\n');

// Step 1: Remove old Prisma Client
console.log('1️⃣  Removing old Prisma Client...');
const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma');
const prismaClientPath = path.join(
  process.cwd(),
  'node_modules',
  '@prisma',
  'client',
);

try {
  if (fs.existsSync(prismaPath)) {
    fs.rmSync(prismaPath, { recursive: true, force: true });
    console.log('   ✅ Removed .prisma folder');
  }
  if (fs.existsSync(prismaClientPath)) {
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
    console.log('   ✅ Removed @prisma/client folder');
  }
} catch (error) {
  console.log('   ⚠️  Could not remove old folders (this is OK)');
}

// Step 2: Reinstall @prisma/client
console.log('\n2️⃣  Reinstalling @prisma/client...');
try {
  execSync('npm install @prisma/client --force', { stdio: 'inherit' });
  console.log('   ✅ @prisma/client reinstalled');
} catch (error) {
  console.error('   ❌ Failed to reinstall @prisma/client');
  process.exit(1);
}

// Step 3: Generate Prisma Client
console.log('\n3️⃣  Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Prisma Client generated');
} catch (error) {
  console.error('   ❌ Failed to generate Prisma Client');
  process.exit(1);
}

// Step 4: Verify
console.log('\n4️⃣  Verifying installation...');
if (
  fs.existsSync(path.join(process.cwd(), 'node_modules', '.prisma', 'client'))
) {
  console.log('   ✅ Prisma Client installed correctly\n');
  console.log('='.repeat(60));
  console.log('✅ HOÀN THÀNH!');
  console.log('='.repeat(60));
  console.log('\n📝 Các bước tiếp theo:');
  console.log('   1. Chạy: npm run dev');
  console.log('   2. Test upload!\n');
} else {
  console.error('   ❌ Prisma Client not found');
  process.exit(1);
}
