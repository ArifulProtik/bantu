import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  body: string;
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  tags: string[];
}

export class UpdateArticleDto {
  @IsUUID()
  id: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  body: string;
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  tags: string[];
}

export class DeleteArticleDto {
  @IsUUID()
  id: string;
}
