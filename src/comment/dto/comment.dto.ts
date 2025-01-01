import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsUUID()
  article_id: string;
  @IsNotEmpty()
  body: string;
}

export class UpdateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  article_id: string;
  @IsNotEmpty()
  body: string;
}
export class DeleteCommentDto {
  @IsUUID()
  id: string;
}
