import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { ForbiddenException } from '@nestjs/common';

type Post = {
  id: string;
  content: string;
  authorId: string;
  repostById?: string;
  originalPostId?: string;
  likedBy: string[];
};

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  getAll(): Post[] {
    return [...this.posts].reverse();
  }

  getById(id: string): Post {
    const post = this.posts.find((p) => p.id === id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  create(dto: CreatePostDto) {
    const newPost = {
      id: Date.now().toString(),
      likedBy: [],
      ...dto,
    };

    this.posts.push(newPost);
    return newPost;
  }

  repost(postId: string, userId: string) {
    const original = this.getById(postId);

    const repost: Post = {
      id: Date.now().toString(),
      content: original.content,
      authorId: original.authorId,
      repostById: userId,
      originalPostId: postId,
      likedBy: original.likedBy,
    };

    this.posts.push(repost);
    return repost;
  }

  toggleLike(postId: string, userId: string) {
    // лайк завжди йде до оригіналу
    const post = this.getById(postId);
    const originalPost = post.originalPostId
      ? this.getById(post.originalPostId)
      : post;

    const alreadyLiked = originalPost.likedBy.includes(userId);

    if (alreadyLiked) {
      originalPost.likedBy = originalPost.likedBy.filter((id) => id !== userId);
    } else {
      originalPost.likedBy.push(userId);
    }

    // оновлюємо likedBy у всіх репостах цього оригіналу
    this.posts.forEach((p) => {
      if (p.originalPostId === originalPost.id) {
        p.likedBy = originalPost.likedBy;
      }
    });

    return originalPost;
  }

  deleteRepost(postId: string, userId: string) {
    const post = this.getById(postId);

    if (post.repostById !== userId) {
      throw new ForbiddenException('You cannot delete this repost');
    }

    this.posts = this.posts.filter((p) => p.id !== postId);
    return { message: 'Deleted' };
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
