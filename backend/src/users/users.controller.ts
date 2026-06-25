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

// ← поза класом
const imageStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

const imageFilter = (req: any, file: any, cb: any) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(extname(file.originalname).toLowerCase()));
};

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
  @UseInterceptors(
    FileInterceptor('file', { storage: imageStorage, fileFilter: imageFilter }),
  )
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(id, `/uploads/${file.filename}`);
  }

  @Post(':id/banner')
  @UseInterceptors(
    FileInterceptor('file', { storage: imageStorage, fileFilter: imageFilter }),
  )
  uploadBanner(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateBanner(id, `/uploads/${file.filename}`);
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
