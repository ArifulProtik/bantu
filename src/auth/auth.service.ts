import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { SigninDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  async signIn(signinDto: SigninDto, ctx: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('email or password is incorrect');
    }
    const isPasswordValid = await argon.verify(
      user.password,
      signinDto.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('email or password is incorrect');
    }
    delete user.password;
    const payload = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    await this.prisma.session.create({
      data: {
        sessionToken: token,
        userAgent: ctx.headers['user-agent'],
        ip: '',
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { access_token: token, user };
  }

  async signUp(signupDto: SignupDto) {
    const hash = await argon.hash(signupDto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          name: signupDto.name,
          password: hash,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'we already have a user with this email',
          );
        }
      }
      throw error;
    }
  }

  async ValidateSession(token: string) {
    const SessionWithUser = await this.prisma.session.findFirst({
      where: {
        sessionToken: token,
      },
      include: {
        user: true,
      },
    });
    if (!SessionWithUser) {
      throw new UnauthorizedException('session is invalid');
    }
    return SessionWithUser.user;
  }
  async signOut(token: string) {
    await this.prisma.session.delete({ where: { sessionToken: token } });
    return { message: 'signed out' };
  }
  async getMe(id: string) {
    return await this.userService.GetUserById(id);
  }
}
