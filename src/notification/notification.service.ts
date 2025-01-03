import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationInput } from './notification-types';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prismaService: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createNotification(data: CreateNotificationInput) {
    const n = await this.prismaService.notification.create({
      data: {
        type: data.type,
        entityId: data.entityId,
        actor: { connect: { id: data.actorId } },
        receiver: { connect: { id: data.receiverId } },
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
    this.notificationGateway.sendNotification(n);
  }
  // getNotifications with cursor-based pagination and return with count and next cursor also return unread notification count for the user
  async getNotifications(userId: string, cursor?: string, take = 10) {
    const notifications = await this.prismaService.notification.findMany({
      where: {
        receiverId: userId,
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
    const unreadCount = await this.prismaService.notification.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
      take: take + 1,
    });
    const hasMore = notifications.length === take + 1;
    return {
      notifications: hasMore ? notifications.slice(0, -1) : notifications,
      count: notifications.length,
      nextCursor: hasMore ? notifications[take - 1].id : null,
      unreadCount,
    };
  }
  // mark notification as read batch operation like latest 50 notification
  async markAsRead(userId: string) {
    await this.prismaService.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });
    return { message: 'Marked as read' };
  }
}
