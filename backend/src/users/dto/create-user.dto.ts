import { IsString, IsEmail, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
