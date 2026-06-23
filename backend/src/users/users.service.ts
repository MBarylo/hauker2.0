import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Bookmark } from './entities/bookmark.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
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
}
