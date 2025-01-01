import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/auth-metadata.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CommentService } from './comment.service';
import {
  CreateCommentDto,
  DeleteCommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @Post()
  createComment(
    @GetUser('id') userid: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(userid, createCommentDto);
  }
  @Put()
  updateComment(
    @GetUser('id') userid: { id: string },
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(userid.id, updateCommentDto);
  }
  @Delete()
  deleteComment(
    @GetUser('id') userid: { id: string },
    @Body('id') deleteCommentDto: DeleteCommentDto,
  ) {
    return this.commentService.deleteComment(userid.id, deleteCommentDto.id);
  }

  @Public()
  @Get(':article_id')
  findCommentsOfArticle(
    @GetUser('id') userid: { id: string },
    @Param('article_id') article_id: string,
  ) {
    return this.commentService.findCommentsofArticle(article_id);
  }
}
