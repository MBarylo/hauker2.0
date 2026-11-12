import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SqlService } from '../sql/sql.service';

type Kind = 'roles' | 'post-types';

// ідентифікатори таблиць беруться лише звідси, а не з запиту клієнта
const TABLES: Record<
  Kind,
  { table: string; usageTable: string; usageCol: string; system: number[] }
> = {
  roles: {
    table: 'role',
    usageTable: '"user"',
    usageCol: '"roleId"',
    system: [1, 2], // admin, user
  },
  'post-types': {
    table: 'post_type',
    usageTable: 'post',
    usageCol: '"postTypeId"',
    system: [1, 2, 3], // original, repost, poll
  },
};

@Controller('admin')
export class AdminToolsController {
  constructor(private sql: SqlService) {}

  private cfg(kind: string) {
    if (!Object.prototype.hasOwnProperty.call(TABLES, kind)) {
      throw new NotFoundException('Unknown reference');
    }
    return TABLES[kind as Kind];
  }

  private toId(id: string) {
    const n = Number(id);
    if (!Number.isInteger(n)) throw new BadRequestException('Invalid id');
    return n;
  }

  // ===== довідники =====

  @Get('reference/:kind')
  list(@Param('kind') kind: string) {
    const c = this.cfg(kind);
    return this.sql.query(
      `SELECT t.id, t.name, t.description, count(x.id)::int AS usage
       FROM ${c.table} t
       LEFT JOIN ${c.usageTable} x ON x.${c.usageCol} = t.id
       GROUP BY t.id
       ORDER BY t.id`,
    );
  }

  @Post('reference/:kind')
  async create(
    @Param('kind') kind: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const c = this.cfg(kind);
    const name = (body.name ?? '').trim();
    if (!name) throw new BadRequestException('Name is required');
    if (name.length > 50) throw new BadRequestException('Name is too long');

    try {
      const rows = await this.sql.query(
        `INSERT INTO ${c.table} (id, name, description)
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM ${c.table}), $1, $2)
         RETURNING id, name, description`,
        [name, (body.description ?? '').trim() || null],
      );
      return { ...rows[0], usage: 0 };
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Name already exists');
      throw e;
    }
  }

  @Patch('reference/:kind/:id')
  async update(
    @Param('kind') kind: string,
    @Param('id') idParam: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const c = this.cfg(kind);
    const id = this.toId(idParam);

    const current = await this.sql.query(
      `SELECT name, description FROM ${c.table} WHERE id = $1`,
      [id],
    );
    if (current.length === 0) throw new NotFoundException('Not found');

    const name = (body.name ?? current[0].name).trim();
    if (!name) throw new BadRequestException('Name is required');
    if (c.system.includes(id) && name !== current[0].name) {
      // назви системних значень використовуються в коді (наприклад, role === 'admin')
      throw new ForbiddenException(
        'The name of a system value cannot be changed',
      );
    }
    const description = (
      body.description ??
      current[0].description ??
      ''
    ).trim();

    try {
      const rows = await this.sql.query(
        `UPDATE ${c.table} SET name = $2, description = $3
         WHERE id = $1
         RETURNING id, name, description`,
        [id, name, description || null],
      );
      return rows[0];
    } catch (e: any) {
      if (e?.code === '23505')
        throw new ConflictException('Name already exists');
      throw e;
    }
  }

  @Delete('reference/:kind/:id')
  async remove(@Param('kind') kind: string, @Param('id') idParam: string) {
    const c = this.cfg(kind);
    const id = this.toId(idParam);
    if (c.system.includes(id)) {
      throw new ForbiddenException('System values cannot be deleted');
    }

    const deleted = await this.sql.execute(
      `DELETE FROM ${c.table} t
       WHERE t.id = $1
         AND NOT EXISTS (
           SELECT 1 FROM ${c.usageTable} x WHERE x.${c.usageCol} = t.id
         )`,
      [id],
    );
    if (deleted === 0) {
      const exists = await this.sql.query(
        `SELECT 1 FROM ${c.table} WHERE id = $1`,
        [id],
      );
      if (exists.length === 0) throw new NotFoundException('Not found');
      throw new ConflictException('Value is in use and cannot be deleted');
    }
    return { message: 'Deleted' };
  }

  // ===== звіт для друку =====

  @Get('report/users')
  usersReport() {
    return this.sql.query(
      `SELECT u.id, u.username, u.email, r.name AS role, u."createdAt",
         (SELECT count(*) FROM post p WHERE p."authorId" = u.id)::int AS posts,
         (SELECT count(*) FROM comment c WHERE c."authorId" = u.id)::int AS comments,
         (SELECT count(*) FROM "like" l WHERE l."userId" = u.id)::int AS likes_given,
         (SELECT count(*) FROM follow f WHERE f."followingId" = u.id)::int AS followers
       FROM "user" u
       JOIN role r ON r.id = u."roleId"
       ORDER BY u."createdAt"`,
    );
  }
}
