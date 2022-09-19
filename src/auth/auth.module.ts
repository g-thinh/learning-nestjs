import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RequestService } from 'src/providers/request.service';
import { UsersModule } from 'src/providers/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy, RtStrategy } from './strategies';
import { LocalStrategy } from './strategies/local.strategy';

const JWT_EXPIRATION_IN_SECONDS = 60 * 60;

@Module({
  providers: [
    AuthService,
    RequestService,
    LocalStrategy,
    JwtStrategy,
    RtStrategy,
  ],
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secret'),
        signOptions: {
          expiresIn: JWT_EXPIRATION_IN_SECONDS,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
