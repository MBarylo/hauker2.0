import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
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

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'hauker_secret',
      });
    } catch (err) {
      // jwt expired / malformed / invalid signature — все веде до 401, а не до 500
      throw new UnauthorizedException('Токен недійсний або прострочений');
    }

    const user = await this.usersService.getById(payload.id);
    if (!user) throw new UnauthorizedException('Користувача не знайдено');
    if (user.role !== 'admin') throw new ForbiddenException('Admins only');

    request.user = payload;
    return true;
  }
}
