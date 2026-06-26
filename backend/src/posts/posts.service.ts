import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private commentsService: CommentsService,
  ) {}

  async getAll() {
    const posts = await this.postsRepository.find();
    const reversed = [...posts].reverse();
    return Promise.all(
      reversed.map(async (p) => {
        const originalId = p.originalPostId ?? p.id;
        const original = p.originalPostId
          ? await this.postsRepository.findOneBy({ id: originalId })
          : p;
        const repostCount = await this.postsRepository.countBy({
          originalPostId: originalId,
        });
        const comments = await this.commentsService.getByPostId(originalId);
        return {
          ...p,
          likedBy: original?.likedBy ?? p.likedBy,
          repostCount,
          commentCount: comments.length,
        };
      }),
    );
  }

  async getById(id: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    const originalId = post.originalPostId ?? post.id;
    const repostCount = await this.postsRepository.countBy({
      originalPostId: originalId,
    });
    const comments = await this.commentsService.getByPostId(originalId);
    return {
      ...post,
      repostCount,
      commentCount: comments.length,
    };
  }

  async create(dto: CreatePostDto, mediaUrls: string[] = []): Promise<Post> {
    const newPost = this.postsRepository.create({
      id: Date.now().toString(),
      likedBy: [],
      mediaUrls,
      ...dto,
    });
    return this.postsRepository.save(newPost);
  }

  async repost(postId: string, userId: string) {
    const original = await this.postsRepository.findOneBy({ id: postId });
    if (!original) throw new NotFoundException('Post not found');
    const repost = this.postsRepository.create({
      id: Date.now().toString(),
      content: original.content,
      authorId: original.authorId,
      repostById: String(userId),
      originalPostId: postId,
      likedBy: [],
      mediaUrls: original.mediaUrls ?? [],
    });
    return this.postsRepository.save(repost);
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    const originalPost = post.originalPostId
      ? await this.postsRepository.findOneBy({ id: post.originalPostId })
      : post;
    if (!originalPost) throw new NotFoundException('Original post not found');

    const id = String(userId);
    const alreadyLiked = originalPost.likedBy.includes(id);

    originalPost.likedBy = alreadyLiked
      ? originalPost.likedBy.filter((u) => u !== id)
      : [...originalPost.likedBy, id];

    await this.postsRepository.save(originalPost);

    // оновлюємо likedBy у всіх репостах
    const reposts = await this.postsRepository.findBy({
      originalPostId: originalPost.id,
    });
    await Promise.all(
      reposts.map((r) => {
        r.likedBy = originalPost.likedBy;
        return this.postsRepository.save(r);
      }),
    );

    return originalPost;
  }

  async deleteRepost(postId: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    if (post.repostById !== String(userId))
      throw new ForbiddenException('You cannot delete this repost');
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }

  async getLikedByUser(userId: string) {
    const posts = await this.postsRepository.find();
    const liked = posts.filter(
      (p) => p.likedBy.includes(String(userId)) && !p.repostById,
    );
    return Promise.all(
      liked.map(async (p) => {
        const originalId = p.originalPostId ?? p.id;
        const repostCount = await this.postsRepository.countBy({
          originalPostId: originalId,
        });
        const comments = await this.commentsService.getByPostId(originalId);
        return { ...p, repostCount, commentCount: comments.length };
      }),
    );
  }

  async getCommentedByUser(userId: string) {
    const comments = await this.commentsService.getByUserId(String(userId));
    const postIds = [...new Set(comments.map((c) => c.postId))];
    const posts = await Promise.all(
      postIds.map((postId) => this.postsRepository.findOneBy({ id: postId })),
    );
    return Promise.all(
      posts
        .filter((p) => p !== null)
        .map(async (p) => {
          const repostCount = await this.postsRepository.countBy({
            originalPostId: p!.id,
          });
          const postComments = await this.commentsService.getByPostId(p!.id);
          return { ...p, repostCount, commentCount: postComments.length };
        }),
    );
  }

  async getFollowingFeed(userIds: string[]) {
    const posts = await this.postsRepository.find();
    const feed = [...posts].reverse().filter(
      (p) =>
        (userIds.includes(p.authorId) && !p.repostById) || // оригінальні пости
        (p.repostById && userIds.includes(p.repostById)), // репости юзерів зі списку
    );

    const result = await Promise.all(
      feed.map(async (p) => {
        const originalId = p.originalPostId ?? p.id;
        const repostCount = await this.postsRepository.countBy({
          originalPostId: originalId,
        });
        const comments = await this.commentsService.getByPostId(originalId);
        const original = p.originalPostId
          ? await this.postsRepository.findOneBy({ id: originalId })
          : p;
        return {
          ...p,
          likedBy: original?.likedBy ?? p.likedBy,
          repostCount,
          commentCount: comments.length,
        };
      }),
    );

    return result;
  }

  async adminDelete(id: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }

  async update(id: string, content?: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    if (content !== undefined) post.content = content;
    return this.postsRepository.save(post);
  }

  async delete(id: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== String(userId))
      throw new ForbiddenException('You cannot delete чужий пост');
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }
}
