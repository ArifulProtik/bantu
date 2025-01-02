import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [NotificationModule],
  controllers: [CommentController],
  providers: [CommentService, NotificationService],
})
export class CommentModule {}
