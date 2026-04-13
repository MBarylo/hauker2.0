import { Controller, Body, Post, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getAll();
  }

  @Post()
  createPost(@Body() body) {
    return this.postsService.create(body);
  }
}
