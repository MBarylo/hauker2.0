import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CommentsModule } from '../comments/comments.module';
import { Bookmark } from '../users/entities/bookmark.entity';
import { Like } from '../likes/entities/like.entity';
import { Media } from '../media/entities/media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Bookmark, Like, Media]),
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
