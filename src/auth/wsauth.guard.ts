import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from './auth.service';

@Injectable()
export class WsAuthenticationGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!context.switchToWs().getClient()) {
      throw new WsException('Invalid request');
    }
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new WsException('Token is required');
    }
    const user = await this.authService.ValidateSession(token);
    if (!user) {
      throw new WsException('Invalid token');
    }
    client.data.user = user;
    return true;
  }
}
