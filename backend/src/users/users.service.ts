import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new ForbiddenException('Cannot follow yourself');
    }

    const existing = await this.followsRepository.findOneBy({
      followerId,
      followingId,
    });

    if (existing) {
      await this.followsRepository.remove(existing);
      return { following: false };
    }

    const follow = this.followsRepository.create({
      id: Date.now().toString(),
      followerId: String(followerId),
      followingId: String(followingId),
    });
    await this.followsRepository.save(follow);
    return { following: true };
  }

  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean }> {
    const existing = await this.followsRepository.findOneBy({
      followerId,
      followingId,
    });
    return { following: !!existing };
  }

  async getFollowers(userId: string) {
    const follows = await this.followsRepository.findBy({
      followingId: userId,
    });
    return Promise.all(follows.map((f) => this.getById(f.followerId)));
  }

  async getFollowing(userId: string) {
    const follows = await this.followsRepository.findBy({ followerId: userId });
    return Promise.all(follows.map((f) => this.getById(f.followingId)));
  }

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create({
      id: Date.now().toString(),
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });
    return this.usersRepository.save(newUser);
  }

  async update(id: string, username?: string): Promise<User> {
    const user = await this.getById(id);
    if (username !== undefined) {
      user.username = username;
    }
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<{ message: string }> {
    const user = await this.getById(id);
    await this.usersRepository.remove(user);
    return { message: 'User deleted' };
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return this.bookmarksRepository.findBy({ userId });
  }

  async toggleBookmark(
    userId: string,
    postId: string,
  ): Promise<{ bookmarked: boolean }> {
    const existing = await this.bookmarksRepository.findOneBy({
      userId,
      postId,
    });

    if (existing) {
      await this.bookmarksRepository.remove(existing);
      return { bookmarked: false };
    }

    const bookmark = this.bookmarksRepository.create({
      id: Date.now().toString(),
      userId,
      postId,
    });
    await this.bookmarksRepository.save(bookmark);
    return { bookmarked: true };
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.getById(id);
    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }

  async updateBanner(id: string, bannerUrl: string): Promise<User> {
    const user = await this.getById(id);
    user.bannerUrl = bannerUrl;
    return this.usersRepository.save(user);
  }
}
