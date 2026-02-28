import { PrismaClient, Role, Department } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (optional - remove in production)
  await prisma.contribution.deleteMany();
  await prisma.user.deleteMany();

  // Create SUPER_ADMIN user
  const superAdmin = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for testing
      email: 'superadmin@artclub.com',
      fullName: 'Super Admin',
      role: Role.SUPER_ADMIN,
      department: Department.SINGING,
    },
  });
  console.log('✅ Created SUPER_ADMIN:', superAdmin.email);

  // Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002', // Fixed UUID for testing
      email: 'admin@artclub.com',
      fullName: 'Club Admin',
      role: Role.ADMIN,
      department: Department.DANCE,
    },
  });
  console.log('✅ Created ADMIN:', admin.email);

  // Create MEMBER user
  const member = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000003', // Fixed UUID for testing
      email: 'member@artclub.com',
      fullName: 'Regular Member',
      role: Role.MEMBER,
      department: Department.RAP,
    },
  });
  console.log('✅ Created MEMBER:', member.email);

  // Create sample contributions for the member
  const contribution1 = await prisma.contribution.create({
    data: {
      week: 'Tuần 1',
      imageUrl: 'https://placeholder.com/receipt1.jpg',
      amount: 20000,
      status: 'PENDING',
      memberId: member.id,
    },
  });
  console.log('✅ Created sample contribution:', contribution1.week);

  const contribution2 = await prisma.contribution.create({
    data: {
      week: 'Tuần 2',
      imageUrl: 'https://placeholder.com/receipt2.jpg',
      amount: 50000,
      status: 'APPROVED',
      memberId: member.id,
    },
  });
  console.log('✅ Created sample contribution:', contribution2.week);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Users:');
  console.log('─────────────────────────────────────────');
  console.log('| Role        | Email                    |');
  console.log('─────────────────────────────────────────');
  console.log('| SUPER_ADMIN | superadmin@artclub.com   |');
  console.log('| ADMIN       | admin@artclub.com        |');
  console.log('| MEMBER      | member@artclub.com       |');
  console.log('─────────────────────────────────────────');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
