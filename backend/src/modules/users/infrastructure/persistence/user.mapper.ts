import type { User as PrismaUser } from '@generated/prisma/client';
import { User } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.reconstitute({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(user: User) {
    return user.toPrimitives();
  }
}
