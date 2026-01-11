import { PrismaClient, Role } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@flex.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

  console.log(`Start seeding admin user (${email}) ...`);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping`);
    return;
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const passwordHash = await bcrypt.hash(password, rounds);
  const user = await prisma.user.create({
    data: {
      email,
      firstName: 'Admin',
      lastName: 'Account',
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent('Admin Account')}`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`Created admin user with id: ${user.id}`);
  console.log(`Admin credentials -> email: ${email} | password: ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
