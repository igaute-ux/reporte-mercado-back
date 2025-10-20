import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || '',
      port: parseInt(process.env.POSTGRES_PORT as string, 10) || 5432,
      database: process.env.POSTGRES_NAME || '',
      username: process.env.POSTGRES_USER || '',
      password: process.env.POSTGRES_PASSWORD || '',
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      synchronize: true,
      logging: false,
      migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
      migrationsTableName: 'migrations',
      ssl: !isProduction
        ? { rejectUnauthorized: false } // si estás en local
        : false,                        // Railway interno no necesita ssl
    };
  },
);
