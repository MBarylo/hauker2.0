import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsEmail, MinLength, Length } from 'class-validator';

class RegisterDto {
  @IsString() @Length(3, 20) username!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}

class LoginDto {
  @IsString() login!: string;
  @IsString() password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.login, dto.password);
  }
}
