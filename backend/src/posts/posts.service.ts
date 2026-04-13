import { Injectable } from '@nestjs/common';

type Post = {
  id: string;
  content: string;
  authorId: string;
};

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  getAll() {
    return this.posts;
  }

  create(post) {
    const newPost = {
      id: Date.now().toString(),
      ...post,
    };
    this.posts.push(newPost);
    return newPost;
  }
}
