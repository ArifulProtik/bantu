import { Controller, Get, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @Get()
  getNotifications(
    @GetUser() user: User,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.notificationService.getNotifications(user.id, cursor, take);
  }
  @Post()
  markAsRead(@GetUser() user: User) {
    return this.notificationService.markAsRead(user.id);
  }
}
