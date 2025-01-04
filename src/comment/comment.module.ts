import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/notification.module';
import { NotificationService } from 'src/socket/notification.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [SocketModule],
  controllers: [CommentController],
  providers: [CommentService, NotificationService],
})
export class CommentModule {}
