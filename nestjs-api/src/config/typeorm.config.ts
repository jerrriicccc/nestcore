import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isCompiled = __filename.endsWith('.js');

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nestjsds',
  entities: [
    isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts',
    isCompiled ? 'dist/**/*.entities.js' : 'src/**/*.entities.ts',
  ],
  migrations: [
    isCompiled ? 'dist/migrations/*{.js,.ts}' : 'src/migrations/*{.js,.ts}',
  ],
  // Respect environment flags so behavior can be toggled via .env
  synchronize: (process.env.DB_SYNC || 'false').toLowerCase() === 'true',
  logging: (process.env.DB_LOGGING || 'false').toLowerCase() === 'true',
});

// Log resolved DB connection info (excluding password) to help debug connectivity issues
const resolvedHost = process.env.DB_HOST || 'localhost';
const resolvedPort = process.env.DB_PORT || '3306';
const resolvedUser = process.env.DB_USERNAME || 'root';
const resolvedDatabase = process.env.DB_DATABASE || 'nestjsds';
console.info(
  `[TypeORM] DB host=${resolvedHost} port=${resolvedPort} user=${resolvedUser} database=${resolvedDatabase} synchronize=${process.env.DB_SYNC || 'false'} logging=${process.env.DB_LOGGING || 'false'}`,
);
