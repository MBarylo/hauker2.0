import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SqlService } from './sql.service';
import * as Q from './sql.queries';

@Controller('sql')
export class SqlController {
  constructor(private sql: SqlService) {}

  // Запит 1
  @Get('q1')
  async q1(@Query('identifier') identifier: string) {
    const rows = await this.sql.query(Q.Q1_FIND_USER_FOR_LOGIN, [identifier]);
    // хеш пароля клієнту не віддаємо
    return rows.map(({ password, ...user }) => user);
  }

  // Запит 2
  @Get('q2/:userId')
  q2(@Param('userId') userId: string) {
    return this.sql.query(Q.Q2_PROFILE, [userId]);
  }

  // Запит 3 (пошук необов'язковий: /sql/q3 або /sql/q3?search=текст)
  @Get('q3')
  q3(@Query('search') search?: string) {
    return this.sql.query(Q.Q3_FEED, [search?.trim() || null]);
  }

  // Запити 4-7
  @Get('q4/:userId')
  q4(@Param('userId') userId: string) {
    return this.sql.query(Q.Q4_SAVED, [userId]);
  }

  @Get('q5/:userId')
  q5(@Param('userId') userId: string) {
    return this.sql.query(Q.Q5_MY_COMMENTS, [userId]);
  }

  @Get('q6/:userId')
  q6(@Param('userId') userId: string) {
    return this.sql.query(Q.Q6_FOLLOWING_FEED, [userId]);
  }

  @Get('q7/:userId')
  q7(@Param('userId') userId: string) {
    return this.sql.query(Q.Q7_LIKED, [userId]);
  }

  // Запит 8: створює таблицю і повертає її вміст
  @Post('q8')
  async q8() {
    await this.sql.query(Q.Q8_DROP_STATS);
    await this.sql.query(Q.Q8_CREATE_STATS);
    return this.sql.query('SELECT * FROM user_stats ORDER BY posts_count DESC');
  }

  // Запит 9
  @Patch('q9/:userId')
  async q9(
    @Param('userId') userId: string,
    @Body() body: { bio?: string; avatarUrl?: string; bannerUrl?: string },
  ) {
    const rows = await this.sql.query(Q.Q9_UPDATE_PROFILE, [
      userId,
      body.bio ?? '',
      body.avatarUrl ?? null,
      body.bannerUrl ?? null,
    ]);
    if (rows.length === 0) throw new NotFoundException('User not found');
    return rows[0];
  }

  // Запит 10
  @Delete('q10/:commentId')
  async q10(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
  ) {
    const deleted = await this.sql.execute(Q.Q10_DELETE_COMMENT, [
      commentId,
      userId,
    ]);
    if (deleted === 0) throw new NotFoundException('Comment not found');
    return { message: 'Deleted', deleted };
  }
}
