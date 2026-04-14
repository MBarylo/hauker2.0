import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 200)
  content!: string;

  @IsString()
  authorId!: string;
}
