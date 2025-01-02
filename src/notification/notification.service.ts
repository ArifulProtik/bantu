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
}
