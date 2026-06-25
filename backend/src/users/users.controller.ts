import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
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

  @Post(':id/follow/:targetId')
  toggleFollow(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.usersService.toggleFollow(id, targetId);
  }

  @Post(':id/bookmarks')
  toggleBookmark(@Param('id') id: string, @Body('postId') postId: string) {
    return this.usersService.toggleBookmark(id, postId);
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
