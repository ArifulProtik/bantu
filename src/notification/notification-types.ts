import { NotificationType } from '@prisma/client';

export type CreateNotificationInput = {
  type: NotificationType;
  entityId: string;
  actorId: string;
  receiverId: string;
};
