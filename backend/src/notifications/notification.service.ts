import { Injectable, Logger } from '@nestjs/common';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private sql: SqlService) {}

  async create(
    userId: string,
    actorId: string,
    type: 'like' | 'comment' | 'follow',
    postId?: string,
  ) {
    if (String(userId) === String(actorId)) return; // про власні дії не сповіщаємо
    try {
      await this.sql.execute(
        `INSERT INTO notification ("userId", "actorId", type, "postId")
         VALUES ($1, $2, $3, $4)`,
        [String(userId), String(actorId), type, postId ?? null],
      );
    } catch (e) {
      // збій сповіщення не має ламати лайк чи коментар
      this.logger.error('Failed to create notification', e as any);
    }
  }

  // отримувач = автор поста
  async notifyPostAuthor(
    postId: string,
    actorId: string,
    type: 'like' | 'comment',
  ) {
    const rows = await this.sql.query<{ authorId: string }>(
      `SELECT "authorId" FROM post WHERE id = $1`,
      [postId],
    );
    if (rows.length === 0) return;
    await this.create(rows[0].authorId, actorId, type, postId);
  }

  // при знятті лайка чи відписці
  async remove(
    userId: string,
    actorId: string,
    type: 'like' | 'follow',
    postId?: string,
  ) {
    await this.sql.execute(
      `DELETE FROM notification
       WHERE "userId" = $1 AND "actorId" = $2 AND type = $3
         AND "postId" IS NOT DISTINCT FROM $4`,
      [String(userId), String(actorId), type, postId ?? null],
    );
  }

  getForUser(userId: string) {
    return this.sql.query(
      `SELECT n.id, n.type, n."postId", n."isRead", n."createdAt",
              a.id AS "actorId", a.username AS actor,
              left(p.content, 80) AS post_preview
       FROM notification n
       JOIN "user" a ON a.id = n."actorId"
       LEFT JOIN post p ON p.id = n."postId"
       WHERE n."userId" = $1
       ORDER BY n."createdAt" DESC`,
      [userId],
    );
  }

  async unreadCount(userId: string) {
    const rows = await this.sql.query<{ count: number }>(
      `SELECT count(*)::int AS count
       FROM notification
       WHERE "userId" = $1 AND "isRead" = false`,
      [userId],
    );
    return { count: rows[0].count };
  }

  async markAllRead(userId: string) {
    const updated = await this.sql.execute(
      `UPDATE notification SET "isRead" = true
       WHERE "userId" = $1 AND "isRead" = false`,
      [userId],
    );
    return { updated };
  }
}
