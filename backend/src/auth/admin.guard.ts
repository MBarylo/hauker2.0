import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) throw new ForbiddenException('No token');

    const token = auth.split(' ')[1];
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET || 'hauker_secret',
    });

    const user = await this.usersService.getById(payload.id);
    if (user.role !== 'admin') throw new ForbiddenException('Admins only');

    request.user = payload;
    return true;
  }
}
