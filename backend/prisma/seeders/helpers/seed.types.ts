import { UserRole } from '@generated/prisma/enums';

export interface UserSeed {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
