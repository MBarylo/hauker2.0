import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mediaStorage } from '../cloudinary.storage';

const toMedia = (f: any) => ({
  url: f.path as string,
  type: f.mimetype?.startsWith('video/') ? 'video' : 'image',
});

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getAll() {
    return this.postsService.getAll();
  }

  @Get('liked/:userId')
  getLikedByUser(@Param('userId') userId: string) {
    return this.postsService.getLikedByUser(userId);
  }

  @Get('commented/:userId')
  getCommentedByUser(@Param('userId') userId: string) {
    return this.postsService.getCommentedByUser(userId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, { storage: mediaStorage }))
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const media = (files ?? []).map(toMedia);
      return await this.postsService.create(dto, media);
    } catch (err) {
      console.error('CREATE POST ERROR:', err);
      throw err;
    }
  }

  @Post('following-feed')
  getFollowingFeed(@Body('userIds') userIds: string[]) {
    return this.postsService.getFollowingFeed(userIds);
  }

  @Post(':id/repost')
  repost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.repost(id, userId);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.toggleLike(id, userId);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 4, { storage: mediaStorage }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let existingMediaUrls: string[] = [];
    if (dto.existingMediaUrls) {
      existingMediaUrls = Array.isArray(dto.existingMediaUrls)
        ? dto.existingMediaUrls
        : [dto.existingMediaUrls];
    }

    const newMedia = (files ?? []).map(toMedia);
    return this.postsService.update(
      id,
      dto.content,
      existingMediaUrls,
      newMedia,
    );
  }

  @Delete(':id/repost')
  deleteRepost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.deleteRepost(id, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.delete(id, userId);
  }
}
