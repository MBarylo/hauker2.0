import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

type User = {
  id: string;
  username: string;
};

@Injectable()
export class UsersService {
  private users: User[] = [];

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(dto: CreateUserDto) {
    const newUser: User = {
      id: Date.now().toString(),
      username: dto.username,
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: string, username?: string) {
    const user = this.getById(id);

    if (username !== undefined) {
      user.username = username;
    }

    return user;
  }

  delete(id: string) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');

    this.users.splice(index, 1);
    return { message: 'User deleted' };
  }
}
