import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RtAuthGuard } from '../common/guards/rt-auth.guard';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(authDto);
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() authDto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(authDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('sub') userId: number): Promise<void> {
    return this.authService.logout(userId);
  }

  @UseGuards(RtAuthGuard)
  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('sub') userId: number,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
