import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { UsersService } from 'src/providers/users/users.service';
import { AuthDto } from './dto';
import { JwtPayload } from './types/jwtPayload';

const JWT_EXPIRATION_IN_SECONDS = 60 * 60;
const JWT_REFRESH_EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findByEmail(email);

    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatches) {
      throw new BadRequestException(
        'Invalid credentials. Unable to validate user.',
      );
    }

    if (user && passwordMatches) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, hashedRt, ...result } = user;
      return result;
    }
    return null;
  }

  async signupLocal(authDto: AuthDto) {
    try {
      const hashedPassword = await this.hashData(authDto.password);
      const newUser = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hashedPassword,
        },
      });

      const refresh_token = await this.createRefreshToken(newUser.id);

      //store the refresh token in the DB
      await this.usersService.setRefreshToken(refresh_token, newUser.id);

      return newUser;
    } catch (error) {
      throw new BadRequestException('User already exists.', error);
    }
  }

  async validateRefreshToken(userId: number, rt: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('User is not logged in.');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);

    if (!rtMatches) {
      throw new ForbiddenException('Refresh tokens dont match.');
    }

    return await this.usersService.excludeUserHash(user);
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async createJwtToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: JWT_EXPIRATION_IN_SECONDS,
    });
    return token;
  }

  public async createRefreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.rt_secret'),
      expiresIn: JWT_EXPIRATION_IN_SECONDS,
    });
    return token;
  }

  //this is where we receive the cookies and sign it with the iat and exp
  public async getCookieWithJwtToken(userId: number) {
    const access_token = await this.createJwtToken(userId);
    const access_cookie = `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${JWT_EXPIRATION_IN_SECONDS}`;
    return {
      access_cookie,
      access_token,
    };
  }

  public async getCookieWithJwtRefreshToken(userId: number) {
    const refresh_token = await this.createRefreshToken(userId);
    const refresh_cookie = `Refresh=${refresh_token}; HttpOnly; Path=/; Max-Age=${JWT_REFRESH_EXPIRATION_IN_SECONDS}`;
    return {
      refresh_cookie,
      refresh_token,
    };
  }
}
