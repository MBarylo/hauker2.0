import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CommentsModule } from '../comments/comments.module';
import { Bookmark } from '../users/entities/bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Bookmark]), CommentsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
