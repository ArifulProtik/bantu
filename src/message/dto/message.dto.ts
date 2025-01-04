import { IsNotEmpty, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsUUID()
  receiver_id: string;
  @IsNotEmpty()
  message: string;
}
