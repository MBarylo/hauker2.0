import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon')
    ? { rejectUnauthorized: false }
    : false,
  entities: ['src/**/*.entity.{js,ts}'],
  migrations: ['src/migrations/*.{js,ts}'],
  synchronize: false,
});

export default AppDataSource;
