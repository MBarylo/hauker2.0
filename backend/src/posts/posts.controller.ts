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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mediaStorage } from '../cloudinary.storage';

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
  create(
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mediaUrls = files?.map((f: any) => f.path) ?? [];
    return this.postsService.create(dto, mediaUrls);
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
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto.content);
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
