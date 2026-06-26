import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const users = await this.usersService.getAll();

    const usernameTaken = users.find((u) => u.username === username);
    if (usernameTaken) throw new ConflictException('Username already taken');

    const emailTaken = users.find((u) => u.email === email);
    if (emailTaken) throw new ConflictException('Email already taken');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });
    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  }

  async login(login: string, password: string) {
    const users = await this.usersService.getAll();

    // логін через username або email
    const user = users.find((u) => u.username === login || u.email === login);

    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Wrong password');

    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
      },
      token,
    };
  }
}
