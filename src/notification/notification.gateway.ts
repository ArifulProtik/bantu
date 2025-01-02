/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseGuards } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Notification } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { SocketIoMiddleware } from 'src/auth/socket.middleware';
import { WsAuthenticationGuard } from 'src/auth/wsauth.guard';

@WebSocketGateway({ namespace: 'ws' })
@UseGuards(WsAuthenticationGuard)
export class NotificationGateway implements OnGatewayInit {
  constructor(private readonly authService: AuthService) {}
  @WebSocketServer()
  server: Server;
  private activeClients = new Map<string, Socket>();

  async afterInit(socket: Socket) {
    socket.use(SocketIoMiddleware(this.authService) as any);
  }
  handleConnection(client: Socket) {
    const user = client.data.user;
    if (user && user.id) {
      this.activeClients.set(user.id, client);
      console.log('connected', user.id);
    }
  }
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user && user.id) {
      this.activeClients.delete(user.id);
      console.log('disconnected', user.id);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
  sendNotification(data: Notification) {
    const client = this.activeClients.get(data.receiverId);
    if (client) {
      client.emit('notification', data);
    }
  }
}
