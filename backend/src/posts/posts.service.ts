import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentsService } from '../comments/comments.service';
import { Bookmark } from '../users/entities/bookmark.entity';
import { Like } from '../likes/entities/like.entity';
import { Media } from '../media/entities/media.entity';
import { POST_TYPE } from '../constants';

export interface MediaInput {
  url: string;
  type: string; // 'image' | 'video'
}

const POST_ID = 1;
const REPOST_ID = 2;
const POLL_ID = 3;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    private commentsService: CommentsService,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async getAll() {
    const posts = await this.postsRepository.find({
      order: { id: 'ASC' },
    });
    const reversed = [...posts].reverse();

    const originalIds = [
      ...new Set(reversed.map((p) => p.originalPostId ?? p.id)),
    ];
    const likesMap = await this.getLikesMap(originalIds);
    const mediaMap = await this.getMediaMap(originalIds);

    return Promise.all(
      reversed.map(async (p) => {
        const originalId = p.originalPostId ?? p.id;
        const repostCount = await this.postsRepository.countBy({
          originalPostId: originalId,
        });
        const comments = await this.commentsService.getByPostId(originalId);
        return {
          ...p,
          likedBy: likesMap.get(originalId) ?? [],
          mediaUrls: mediaMap.get(originalId) ?? [],
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
    const likesMap = await this.getLikesMap([originalId]);
    const mediaMap = await this.getMediaMap([originalId]);
    const repostCount = await this.postsRepository.countBy({
      originalPostId: originalId,
    });
    const comments = await this.commentsService.getByPostId(originalId);
    return {
      ...post,
      likedBy: likesMap.get(originalId) ?? [],
      mediaUrls: mediaMap.get(originalId) ?? [],
      repostCount,
      commentCount: comments.length,
    };
  }

  async create(dto: CreatePostDto, media: MediaInput[] = []) {
    const post = await this.postsRepository.save(
      this.postsRepository.create({
        id: Date.now().toString(),
        postTypeId: dto.postTypeId ?? POST_TYPE.ORIGINAL,
        ...dto,
      }),
    );

    const items = media.slice(0, 4);
    if (items.length > 0) {
      await this.mediaRepository.save(
        items.map((m) =>
          this.mediaRepository.create({
            postId: post.id,
            url: m.url,
            type: m.type,
          }),
        ),
      );
    }
    return { ...post, likedBy: [], mediaUrls: items.map((m) => m.url) };
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
      postTypeId: POST_TYPE.REPOST,
    });
    console.log('REPOST ENTITY:', repost);
    return this.postsRepository.save(repost);
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    const originalPost = post.originalPostId
      ? await this.postsRepository.findOneBy({ id: post.originalPostId })
      : post;
    if (!originalPost) throw new NotFoundException('Original post not found');

    const uid = String(userId);
    const existing = await this.likesRepository.findOneBy({
      postId: originalPost.id,
      userId: uid,
    });

    if (existing) {
      await this.likesRepository.remove(existing);
    } else {
      await this.likesRepository.save(
        this.likesRepository.create({ postId: originalPost.id, userId: uid }),
      );
    }

    const likesMap = await this.getLikesMap([originalPost.id]);
    return { ...originalPost, likedBy: likesMap.get(originalPost.id) ?? [] };
  }

  private async getLikesMap(postIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (postIds.length === 0) return map;

    const likes = await this.likesRepository.find({
      where: { postId: In(postIds) },
      order: { createdAt: 'ASC' },
    });
    for (const like of likes) {
      const list = map.get(like.postId);
      if (list) list.push(like.userId);
      else map.set(like.postId, [like.userId]);
    }
    return map;
  }

  private async getMediaMap(postIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (postIds.length === 0) return map;

    const items = await this.mediaRepository.find({
      where: { postId: In(postIds) },
      order: { id: 'ASC' },
    });
    for (const m of items) {
      const list = map.get(m.postId);
      if (list) list.push(m.url);
      else map.set(m.postId, [m.url]);
    }
    return map;
  }

  private async deletePostDependents(postIds: string[]) {
    if (postIds.length === 0) return;
    await this.likesRepository.delete({ postId: In(postIds) });
    await this.mediaRepository.delete({ postId: In(postIds) });
    await this.bookmarksRepository.delete({ postId: In(postIds) });
  }

  async deleteRepost(postId: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    if (post.repostById !== String(userId))
      throw new ForbiddenException('You cannot delete this repost');

    await this.deletePostDependents([postId]);
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }

  async getLikedByUser(userId: string) {
    const likes = await this.likesRepository.find({
      where: { userId: String(userId) },
      relations: { post: true },
      order: { createdAt: 'DESC' },
    });
    const posts = likes.map((l) => l.post).filter((p) => !p.repostById);
    const likesMap = await this.getLikesMap(posts.map((p) => p.id));
    const mediaMap = await this.getMediaMap(posts.map((p) => p.id));
    return Promise.all(
      posts.map(async (p) => {
        const repostCount = await this.postsRepository.countBy({
          originalPostId: p.id,
        });
        const comments = await this.commentsService.getByPostId(p.id);
        return {
          ...p,
          likedBy: likesMap.get(p.id) ?? [],
          mediaUrls: mediaMap.get(p.id) ?? [],
          repostCount,
          commentCount: comments.length,
        };
      }),
    );
  }

  async getCommentedByUser(userId: string) {
    const comments = await this.commentsService.getByUserId(String(userId));
    const postIds = [...new Set(comments.map((c) => c.postId))];
    const found = await Promise.all(
      postIds.map((postId) => this.postsRepository.findOneBy({ id: postId })),
    );
    const posts = found.filter((p): p is Post => p !== null);
    const likesMap = await this.getLikesMap(posts.map((p) => p.id));
    const mediaMap = await this.getMediaMap(posts.map((p) => p.id));
    return Promise.all(
      posts.map(async (p) => {
        const repostCount = await this.postsRepository.countBy({
          originalPostId: p.id,
        });
        const postComments = await this.commentsService.getByPostId(p!.id);
        return {
          ...p,
          repostCount,
          likedBy: likesMap.get(p!.id) ?? [],
          mediaUrls: mediaMap.get(p!.id) ?? [],
          commentCount: postComments.length,
        };
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

    const originalIds = [...new Set(feed.map((p) => p.originalPostId ?? p.id))];
    const likesMap = await this.getLikesMap(originalIds);
    const mediaMap = await this.getMediaMap(originalIds);

    const result = await Promise.all(
      feed.map(async (p) => {
        const originalId = p.originalPostId ?? p.id;
        const repostCount = await this.postsRepository.countBy({
          originalPostId: originalId,
        });
        const comments = await this.commentsService.getByPostId(originalId);

        return {
          ...p,
          likedBy: likesMap.get(originalId) ?? [],
          mediaUrls: mediaMap.get(originalId) ?? [],
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

    const reposts = await this.postsRepository.findBy({ originalPostId: id });

    await this.deletePostDependents([id, ...reposts.map((r) => r.id)]);
    await this.postsRepository.remove(reposts);
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }

  async update(
    id: string,
    content?: string,
    existingMediaUrls?: string[],
    newMedia: MediaInput[] = [],
  ) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');

    if (content !== undefined) post.content = content;
    const saved = await this.postsRepository.save(post);

    if (existingMediaUrls !== undefined || newMedia.length > 0) {
      const keep = new Set(existingMediaUrls ?? []);
      const current = await this.mediaRepository.find({
        where: { postId: id },
        order: { id: 'ASC' },
      });
      const toRemove = current.filter((m) => !keep.has(m.url));
      const keptCount = current.length - toRemove.length;

      if (toRemove.length > 0) await this.mediaRepository.remove(toRemove);

      const toAdd = newMedia.slice(0, Math.max(0, 4 - keptCount));
      if (toAdd.length > 0) {
        await this.mediaRepository.save(
          toAdd.map((m) =>
            this.mediaRepository.create({
              postId: id,
              url: m.url,
              type: m.type,
            }),
          ),
        );
      }
    }

    const likesMap = await this.getLikesMap([id]);
    const mediaMap = await this.getMediaMap([id]);
    return {
      ...saved,
      likedBy: likesMap.get(id) ?? [],
      mediaUrls: mediaMap.get(id) ?? [],
    };
  }

  async delete(id: string, userId: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== String(userId))
      throw new ForbiddenException('You cannot delete this post');
    const reposts = await this.postsRepository.findBy({ originalPostId: id });

    await this.deletePostDependents([id, ...reposts.map((r) => r.id)]);
    await this.postsRepository.remove(reposts);
    await this.postsRepository.remove(post);
    return { message: 'Deleted' };
  }
}
