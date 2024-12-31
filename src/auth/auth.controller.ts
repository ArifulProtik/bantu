import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { Public } from './decorators/auth-metadata.decorator';
import { GetToken, GetUser } from './decorators/get-user.decorator';
import { SigninDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signinDto: SigninDto, @Request() ctx: any) {
    return this.authService.signIn(signinDto, ctx);
  }
  @Public()
  @Post('signup')
  signUp(@Body() singupDto: SignupDto) {
    return this.authService.signUp(singupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signout')
  signOut(@GetToken() token: string) {
    return this.authService.signOut(token);
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  me(@GetUser() user: User) {
    return this.authService.getMe(user.id);
  }
}
