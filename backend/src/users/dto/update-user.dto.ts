import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  username!: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  bio?: string;
}
