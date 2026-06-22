import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(1, 200)
  content!: string;

  @IsString()
  authorId!: string;

  @IsString()
  postId!: string; // до якого поста належить коментар
}
