import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';

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

  delete(id: string) {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Post not found');

    this.posts.splice(index, 1);
    return { message: 'Post deleted' };
  }
}
