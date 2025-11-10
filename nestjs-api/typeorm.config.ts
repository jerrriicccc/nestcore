import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables from .env file
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 10,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/src/**/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  migrationsTableName: 'migrations',
});
