import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { ForbiddenException } from '@nestjs/common';

type Post = {
  id: string;
  content: string;
  authorId: string;
};

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  getAll(): Post[] {
    return this.posts;
  }

  getById(id: string): Post {
    const post = this.posts.find((p) => p.id === id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  create(dto: CreatePostDto) {
    const newPost = {
      id: Date.now().toString(),
      ...dto,
    };

    this.posts.push(newPost);
    return newPost;
  }

  update(id: string, content?: string): Post {
    const post = this.getById(id);

    if (content !== undefined) {
      post.content = content;
    }

    return post;
  }

  delete(id: string, userId: string) {
    const post = this.getById(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('You cannot delete чужий пост');
    }

    this.posts = this.posts.filter((p) => p.id !== id);
    return { message: 'Deleted' };
  }
}
