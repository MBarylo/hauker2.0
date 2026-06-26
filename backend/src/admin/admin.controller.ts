import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { CommentsService } from '../comments/comments.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  @Get('users')
  getAllUsers() {
    return this.usersService.getAll();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('posts')
  getAllPosts() {
    return this.postsService.getAll();
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.postsService.adminDelete(id);
  }

  @Get('comments')
  getAllComments() {
    return this.commentsService.getAll();
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string) {
    return this.commentsService.adminDelete(id);
  }
}
