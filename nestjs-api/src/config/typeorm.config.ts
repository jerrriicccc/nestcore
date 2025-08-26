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
  synchronize: false,
  logging: false,
});
