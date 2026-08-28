import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient, UserRole } from '@generated/prisma/client';
import { UserSeed } from './helpers/seed.types';
import { randomUUID } from 'node:crypto';

const seeds: UserSeed[] = [
  {
    name: 'Admin Mokka',
    email: 'admin@mokka.local',
    password: 'mokka123',
    role: UserRole.ADMIN,
  },
  {
    name: faker.person.fullName(),
    email: 'cajero@mokka.local',
    password: 'mokka123',
    role: UserRole.CAJERO,
  },
  {
    name: faker.person.fullName(),
    email: 'mesero@mokka.local',
    password: 'mokka123',
    role: UserRole.MESERO,
  },
];

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding users...');

  const usersData: Prisma.UserCreateManyInput[] = await Promise.all(
    seeds.map(async (seed) => ({
      id: randomUUID(),
      name: seed.name,
      email: seed.email,
      passwordHash: await argon2.hash(seed.password),
      role: seed.role,
    })),
  );

  const users = await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  console.log(`✅ ${users.count} users created.`);
  return users;
}
