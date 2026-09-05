import { UserRole } from '@generated/prisma/enums';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { DuplicatedEmailError } from '../../domain/errors/duplicated-email.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly listUsers: ListUsersUseCase,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.createUser.execute(dto);
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof DuplicatedEmailError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.listUsers.execute();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const user = await this.getUser.execute(id);
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
