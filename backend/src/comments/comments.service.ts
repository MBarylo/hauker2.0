import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

type Comment = {
  id: string;
  content: string;
  authorId: string;
  postId: string;
};

@Injectable()
export class CommentsService {
  private comments: Comment[] = [];

  // повертає всі коментарі до конкретного поста
  getByPostId(postId: string): Comment[] {
    return this.comments.filter((c) => c.postId === postId);
  }

  create(dto: CreateCommentDto): Comment {
    const newComment = {
      id: Date.now().toString(),
      ...dto,
    };
    this.comments.push(newComment);
    return newComment;
  }

  delete(id: string, userId: string): { message: string } {
    const comment = this.comments.find((c) => c.id === id);
    if (!comment) throw new NotFoundException('Comment not found');

    // тільки автор може видалити свій коментар
    if (comment.authorId !== userId) {
      throw new NotFoundException('Forbidden');
    }

    this.comments = this.comments.filter((c) => c.id !== id);
    return { message: 'Deleted' };
  }
}
