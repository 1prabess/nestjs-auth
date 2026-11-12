import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entities.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities,
  migrations: [import.meta.dirname + '/migrations/**/*.{ts,js}'],
  synchronize: false,
});