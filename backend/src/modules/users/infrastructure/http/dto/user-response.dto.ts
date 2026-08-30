import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
