import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  getByPostId(postId: string): Promise<Comment[]> {
    return this.commentsRepository.findBy({ postId });
  }

  getByUserId(userId: string): Promise<Comment[]> {
    return this.commentsRepository.findBy({ authorId: userId });
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    const newComment = this.commentsRepository.create({
      id: Date.now().toString(),
      ...dto,
    });
    return this.commentsRepository.save(newComment);
  }

  getAll(): Promise<Comment[]> {
    return this.commentsRepository.find();
  }

  async adminDelete(id: string) {
    const comment = await this.commentsRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentsRepository.remove(comment);
    return { message: 'Deleted' };
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentsRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new NotFoundException('Forbidden');
    await this.commentsRepository.remove(comment);
    return { message: 'Deleted' };
  }
}
