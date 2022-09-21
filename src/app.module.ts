import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { authConfig } from './config/auth.config';
import { dbConfig } from './config/db.config';
import { mikroOrmConfigAsync } from './database/mikro-orm.config';
import { PrismaModule } from './providers/prisma/prisma.module';
import { RequestService } from './providers/request.service';
import { UsersModule } from './providers/users/users.module';
import { UsersController } from './providers/users/users.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      load: [authConfig, dbConfig],
    }),
    PrismaModule,
    MikroOrmModule.forRootAsync(mikroOrmConfigAsync),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            levelFirst: true,
          },
        },
      },
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    RequestService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
