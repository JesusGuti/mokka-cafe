import { UserRole } from '@generated/prisma/enums';
import { BaseEntityProps } from '@shared/domain/entities/base.entity';
import { InvalidUserError } from '../errors/invalid-user.error';
import { Email } from '@shared/domain/value-objects/email.vo';

export interface UserProps extends BaseEntityProps {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidUserError('El nombre es obligatorio');
    }

    const email = Email.create(props.email).value;

    if (!props.passwordHash) {
      throw new InvalidUserError('El hash de contraseña es obligatorio');
    }

    const now = new Date();

    return new User({
      id: props.id,
      name,
      email,
      passwordHash: props.passwordHash,
      role: props.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): UserProps {
    return { ...this.props };
  }
}
