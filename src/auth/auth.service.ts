import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/providers/users/users.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { User } from 'src/providers/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  // info inside JSON web tokens
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const getAccessToken = this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: this.configService.get<string>('auth.secret'),
        expiresIn: 60 * 15,
      },
    );

    const getRefreshToken = this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: this.configService.get<string>('auth.rt_secret'),
        expiresIn: 60 * 60 * 24 * 7,
      },
    );

    const [jwt, rt] = await Promise.all([getAccessToken, getRefreshToken]);

    return {
      access_token: jwt,
      refresh_token: rt,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'hashedRt' | 'hashedPassword'> | null> {
    const user = await this.usersService.findByEmail(email);

    const passwordMatches = bcrypt.compare(password, user.hashedPassword);

    if (user && passwordMatches) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, hashedRt, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('auth.secret'),
      }),
    };
  }

  async signupLocal(authDto: AuthDto): Promise<Tokens> {
    const newUser = await this.usersService.create(authDto);
    const tokens = await this.getTokens(newUser.id, newUser.email);

    //store the refresh token in the DB
    await this.updateRtHash(newUser.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(authDto: AuthDto): Promise<Tokens> {
    const user = await this.usersService.findByEmail(authDto.email);

    if (!user) {
      throw new ForbiddenException('Access Denied.');
    }

    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.hashedPassword,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied.');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.update(userId, {
      hashedRt: null,
    });
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.usersService.findByUserId(userId);

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access Denied.');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);

    if (!rtMatches) {
      throw new ForbiddenException('Access Denied.');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.usersService.update(userId, { hashedRt: hash });
  }
}
