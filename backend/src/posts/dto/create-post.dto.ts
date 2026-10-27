import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { POST_TYPE } from '../../constants';

export class CreatePostDto {
  @IsString()
  @Length(1, 200)
  content!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([POST_TYPE.ORIGINAL, POST_TYPE.POLL])
  postTypeId?: number;

  @IsString()
  authorId!: string;
}
