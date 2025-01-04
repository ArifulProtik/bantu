import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/notification.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [SocketModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
