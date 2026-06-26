import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { avatarStorage, bannerStorage } from '../cloudinary.storage';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Get(':id/bookmarks')
  getBookmarks(@Param('id') id: string) {
    return this.usersService.getBookmarks(id);
  }

  @Get(':id/followers')
  getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @Get(':id/is-following/:targetId')
  isFollowing(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.usersService.isFollowing(id, targetId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post(':id/follow/:targetId')
  toggleFollow(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.usersService.toggleFollow(id, targetId);
  }

  @Post(':id/bookmarks')
  toggleBookmark(@Param('id') id: string, @Body('postId') postId: string) {
    return this.usersService.toggleBookmark(id, postId);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: avatarStorage }))
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(id, (file as any).path);
  }

  @Post(':id/banner')
  @UseInterceptors(FileInterceptor('file', { storage: bannerStorage }))
  uploadBanner(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateBanner(id, (file as any).path);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto.username);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
