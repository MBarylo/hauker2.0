import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SqlService {
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon')
      ? { rejectUnauthorized: false }
      : false,
  });

  async query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  async execute(text: string, params: any[] = []): Promise<number> {
    const result = await this.pool.query(text, params);
    return result.rowCount ?? 0;
  }
}
