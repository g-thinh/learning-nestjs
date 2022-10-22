import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { AuthInterceptor } from 'src/common/interceptors/auth.interceptor';
import { LogoutInterceptor } from 'src/common/interceptors/logout.interceptor';
import { RefreshInterceptor } from 'src/common/interceptors/refresh.interceptor';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RtAuthGuard } from '../../common/guards/rt-auth.guard';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { PayloadDto } from './dto/payload.dto';
import { RequestWithUser } from './types/requestWithUser';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthDto })
  @ApiOperation({
    summary: 'Create a new user to authenticate with using the local strategy',
  })
  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() authDto: AuthDto) {
    return await this.authService.signupLocal(authDto);
  }

  @ApiBody({ type: AuthDto })
  @ApiOperation({
    summary: 'Authenticate user credentials using the local strategy',
  })
  @ApiOkResponse({
    type: PayloadDto,
    description: 'The user has been succesfully authenticated.',
  })
  @ApiBadRequestResponse({ description: 'User has invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(RefreshInterceptor, AuthInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('/local/signin')
  async login(@Req() request: RequestWithUser) {
    return request.user;
  }

  @ApiCookieAuth('Authentication')
  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LogoutInterceptor)
  async logout() {
    return { message: 'User has successfully logged out' };
  }

  @ApiCookieAuth('Refresh')
  @UseGuards(RtAuthGuard)
  @UseInterceptors(AuthInterceptor)
  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() request: RequestWithUser) {
    return request.user;
  }
}
