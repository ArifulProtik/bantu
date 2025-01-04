import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/socket/notification.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}
  async createComment(userid: string, createCommentDto: CreateCommentDto) {
    const a = await this.prismaService.article.findUnique({
      where: { id: createCommentDto.article_id },
      include: {
        author: true,
      },
    });
    if (!a) {
      throw new ForbiddenException('Article not found');
    }
    if (a.authorId !== userid) {
      await this.notificationService.createNotification({
        actorId: userid,
        receiverId: a.authorId,
        entityId: createCommentDto.article_id,
        type: 'Comment',
      });
    }
    return this.prismaService.comment.create({
      data: {
        body: createCommentDto.body,
        Article: { connect: { id: createCommentDto.article_id } },
        commentor: { connect: { id: userid } },
      },
    });
  }
  async updateComment(userid: string, UpdateCommentDto: UpdateCommentDto) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: UpdateCommentDto.article_id },
      include: { commentor: true },
    });
    if (comment.CommentorId !== userid) {
      throw new ForbiddenException(
        'You are not authorized to update this comment',
      );
    }
    const { article_id, ...rest } = UpdateCommentDto;
    return this.prismaService.comment.update({
      where: { id: article_id },
      data: rest,
    });
  }
  async deleteComment(userid: string, id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: id },
      include: {
        commentor: true,

        Article: {
          select: {
            authorId: true,
          },
        },
      },
    });
    // Check if the user is either the commentor or the article's author
    if (comment.CommentorId !== userid && comment.Article.authorId !== userid) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    return this.prismaService.comment.delete({ where: { id: id } });
  }

  async findCommentsofArticle(article_id: string) {
    return this.prismaService.comment.findMany({
      where: { articleId: article_id },
      include: {
        commentor: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_picture: true,
          },
        },
      },
    });
  }
}
