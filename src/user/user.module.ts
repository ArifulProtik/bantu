import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/notification.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [SocketModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
