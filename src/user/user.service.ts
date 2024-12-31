import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  async UpdateUsername(id: string, username: string) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      omit: {
        password: true,
      },
      data: {
        username,
      },
    });
  }
  async UpoateUser(id: string, updateUserDto: UpdateUserDto) {
    return await this.prismaService.user.update({
      where: {
        id: id,
      },
      omit: {
        password: true,
      },
      data: {
        ...updateUserDto,
      },
    });
  }
  async ChangePassword(id: string, passwordDto: PasswordDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
    });
    const isValidPass = await argon.verify(
      user.password,
      passwordDto.old_password,
    );
    if (!isValidPass) {
      throw new ForbiddenException('Incorrect old password');
    }
    const hashedPass = await argon.hash(passwordDto.password);

    return await this.prismaService.user.update({
      where: {
        id,
      },
      omit: {
        password: true,
      },
      data: {
        password: hashedPass,
      },
    });
  }

  async GetUserById(id: string) {
    return await this.prismaService.user.findFirst({
      omit: {
        password: true,
      },
      where: {
        id,
      },
    });
  }
}
