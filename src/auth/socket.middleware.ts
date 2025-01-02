/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const SocketIoMiddleware = (
  authService: AuthService,
): SocketMiddleware => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake?.headers?.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('Token is required');
      }
      const user = await authService.ValidateSession(token);
      if (!user) {
        throw new Error('Invalid token');
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  };
};
