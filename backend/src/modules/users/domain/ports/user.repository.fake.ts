import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  save(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    const user = [...this.users.values()].find((u) => u.email === email);
    return Promise.resolve(user ?? null);
  }

  findAll(): Promise<User[]> {
    return Promise.resolve([...this.users.values()]);
  }

  delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }

  update(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }
}
