import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/socket/notification.service';
import { PasswordDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}
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
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot follow yourself');
    }
    const follow = await this.prismaService.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });
    if (follow) {
      throw new ForbiddenException('You are already following this user');
    }
    const f = await this.prismaService.follow.create({
      data: {
        follower: { connect: { id: followerId } },
        following: { connect: { id: followingId } },
      },
    });
    if (f) {
      await this.notificationService.createNotification({
        type: 'Follow',
        entityId: f.id,
        actorId: followerId,
        receiverId: followingId,
      });
    }
    return { message: 'Followed successfully' };
  }
  async unfollowUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot unfollow yourself');
    }
    const follow = await this.prismaService.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!follow) {
      throw new ForbiddenException('You are not following this user');
    }
    await this.prismaService.follow.delete({
      where: { id: follow.id },
    });
    return { message: 'Unfollowed successfully' };
  }
  // GetFollwer with cusrsor based pagination
  async getFollower(userid: string, take = 10, cursor?: string) {
    const followers = await this.prismaService.follow.findMany({
      where: {
        followingId: userid,
      },
      take,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            profile_picture: true,
          },
        },
      },
    });
    const total = await this.prismaService.follow.count({
      where: {
        followingId: userid,
      },
    });
    const nextCursor =
      followers.length === take ? followers[followers.length - 1].id : null;
    return { total, nextCursor, followers };
  }
  async getFollowing(userid: string, take = 10, cursor?: string) {
    const following = await this.prismaService.follow.findMany({
      where: {
        followerId: userid,
      },
      take,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            profile_picture: true,
          },
        },
      },
    });
    const total = await this.prismaService.follow.count({
      where: {
        followerId: userid,
      },
    });
    const nextCursor =
      following.length === take ? following[following.length - 1].id : null;
    return { total, nextCursor, following };
  }
}
