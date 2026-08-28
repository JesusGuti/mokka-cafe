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
    Object.assign(dto, user.toPrimitives());
    return dto;
  }
}
