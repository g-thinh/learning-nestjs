import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';
import { MikroOrmModuleAsyncOptions } from '@mikro-orm/nestjs';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

const logger = new Logger('MikroORM');
class MikroOrmConfig {
  static getOrmConfig(configService: ConfigService): Options {
    return {
      type: 'mysql',
      dbName: configService.get<string>('db.name'),
      host: configService.get<string>('db.host'),
      user: configService.get<string>('db.user'),
      port: configService.get<number>('db.port'),
      password: configService.get<string>('db.password'),
      entities: ['./dist/**/*.entity.js'],
      entitiesTs: ['./src/**/*.entity.ts'],
      debug: true,
      logger: logger.log.bind(logger),
      driverOptions: {
        connection: {
          ssl: {
            rejectUnauthorized: true,
          },
        },
      },
    };
  }
}

// the config file is needed for the Mikro-ORM CLI
const orm: Options = {
  type: 'mysql',
  dbName: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: +process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    path: './src/database/migrations',
  },
  driverOptions: {
    connection: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  },
};

export default orm;

export const mikroOrmConfigAsync: MikroOrmModuleAsyncOptions<
  IDatabaseDriver<Connection>
> = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<Options> =>
    MikroOrmConfig.getOrmConfig(configService),
};
