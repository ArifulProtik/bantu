import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/socket/notification.service';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getOrCreateConversation(senderId: string, receiverId: string) {
    // check if both user follow each other before creating a conversation
    const follow = await this.prismaService.follow.findMany({
      where: {
        OR: [
          { followerId: senderId, followingId: receiverId },
          { followerId: receiverId, followingId: senderId },
        ],
      },
    });
    if (follow.length < 2) {
      throw new ForbiddenException(
        'You are not allowed to create conversation with this user',
      );
    }
    // check if conversation already exists
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        members: {
          every: {
            id: {
              in: [senderId, receiverId],
            },
          },
        },
      },
    });
    if (conversation) {
      return conversation;
    }
    // create conversation
    return await this.prismaService.conversation.create({
      data: {
        members: {
          connect: [{ id: senderId }, { id: receiverId }],
        },
      },
    });
  }

  async sendMessage(senderId: string, msgDto: SendMessageDto) {
    // get Conversation from database and check if the sender and receiver are part of the conversation
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        members: {
          every: {
            id: {
              in: [senderId, msgDto.receiver_id],
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new ForbiddenException(
        'You are not allowed to send message to this user',
      );
    }
    // create the message
    const msg = await this.prismaService.message.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: msgDto.receiver_id } },
        body: msgDto.message,
        ackowledgement: 'Sent',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
    // send message to receiver
    if (msg) {
      // get the receiver socket and send the message
      this.notificationService.sendMessages(msg);
    }
    return msg;
  }

  // get all messages between two users with cursor based pagination and limit
  async getMessages(
    userid: string,
    receiverId: string,
    conversationId: string,
    cursor?: string,
    take = 60,
  ) {
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        members: {
          every: {
            id: {
              in: [userid, receiverId],
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new ForbiddenException(
        'You are not allowed to view this conversation',
      );
    }
    return await this.prismaService.message.findMany({
      where: {
        conversationId,
        createdAt: cursor
          ? {
              lt: new Date(cursor),
            }
          : undefined,
      },
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // get all conversations of a user and with most recent message
  async getUserConversations(userId: string, cursor?: string, take = 20) {
    return this.prismaService.conversation.findMany({
      where: {
        members: {
          some: { id: userId },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            name: true,
            profile_picture: true,
          },
        }, // To include other participant details
        Message: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      take,
      skip: cursor ? 1 : 0,
    });
  }
}
