import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // GET /comments/:postId — отримати коментарі поста
  @Get(':postId')
  getByPostId(@Param('postId') postId: string) {
    return this.commentsService.getByPostId(postId);
  }

  // POST /comments — створити коментар
  @Post()
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  // DELETE /comments/:id — видалити коментар
  @Delete(':id')
  delete(@Param('id') id: string, @Body('userId') userId: string) {
    return this.commentsService.delete(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('userId') userId: string,
  ) {
    return this.commentsService.update(id, content, userId);
  }
}
