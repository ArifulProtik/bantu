import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SendMessageDto } from './dto/message.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('/data/:userId')
  getMessages(
    @GetUser('id') id: string,
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.messageService.getMessages(id, userId, cursor, take);
  }
  @Post('send')
  sendMessage(
    @GetUser('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(id, sendMessageDto);
  }
  @Get('conversations/:userId')
  getConversations(
    @GetUser('id') id: string,
    @Param('userId') receiverId: string,
  ) {
    return this.messageService.getOrCreateConversation(id, receiverId);
  }

  @Get('myconversations')
  getMyConversations(
    @GetUser('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.messageService.getUserConversations(id, cursor, take);
  }
}
