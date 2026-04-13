import { Injectable } from '@nestjs/common';

type User = {
  id: string;
  username: string;
};

@Injectable()
export class UsersService {
  private users: User[] = [];

  getAll() {
    return this.users;
  }

  create(user) {
    const newUser = {
      id: Date.now().toString(),
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }
}
