import { ForbiddenException, Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createArticle(userid: string, createArticleDto: CreateArticleDto) {
    return this.prismaService.article.create({
      data: {
        ...createArticleDto,
        slug: this.GenerateSlugWithUUID(createArticleDto.title),
        author: { connect: { id: userid } },
      },
    });
  }
  async updateArticle(userid: string, updateArticleDto: UpdateArticleDto) {
    const article = await this.prismaService.article.findUnique({
      where: { id: updateArticleDto.id },
      include: { author: true },
    });
    if (article.authorId !== userid) {
      throw new ForbiddenException(
        'You are not authorized to update this article',
      );
    }
    const { id, ...rest } = updateArticleDto;
    return this.prismaService.article.update({
      where: { id: id },
      data: rest,
    });
  }
  async deleteArticle(userid: string, id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id: id },
      include: { author: true },
    });
    if (article.authorId !== userid) {
      throw new ForbiddenException(
        'You are not authorized to delete this article',
      );
    }
    return this.prismaService.article.delete({ where: { id: id } });
  }
  GenerateSlugWithUUID(title: string): string {
    console.log(title);
    return `${title.replace(/\s+/g, '-').toLowerCase()}-${uuidv4()}`;
  }

  async findArticleBySlug(s: string) {
    return this.prismaService.article.findUnique({
      where: { slug: s },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_picture: true,
          },
        },
        _count: {
          select: { Comment: true, ArticleReaction: true },
        },
      },
    });
  }

  // Find all articles with cursor-based pagination

  async findAllArticles(
    cursor: string | null,
    take = 10,
  ): Promise<{
    total: number;
    nextCursor: string | null;
    articles: Article[];
  }> {
    // Fetch the total count of articles for reference
    const total = await this.prismaService.article.count();

    // Fetch the articles based on cursor pagination
    const articles = await this.prismaService.article.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_picture: true,
          },
        },
        _count: {
          select: { Comment: true, ArticleReaction: true },
        },
      },
    });

    // Determine the next cursor if more articles exist
    const nextCursor =
      articles.length === take ? articles[articles.length - 1].id : null;

    // Return the total count, articles, and the next cursor
    return {
      total,
      nextCursor,
      articles,
    };
  }

  // Find all articles with authorId and cursor-based pagination
  async findAllArticlesByAuthorUsername(
    username: string,
    cursor: string,
    take = 10,
  ): Promise<{
    total: number;
    nextCursor: string | null;
    articles: Article[];
  }> {
    // Fetch the total count of articles for reference
    const user = await this.prismaService.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const total = await this.prismaService.article.count({
      where: { authorId: user.id },
    });

    // Fetch the articles based on cursor pagination

    const articles = await this.prismaService.article.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      where: { authorId: user.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_picture: true,
          },
        },
        _count: {
          select: { Comment: true, ArticleReaction: true },
        },
      },
    });

    // Determine the next cursor if more articles exist
    const nextCursor =
      articles.length === take ? articles[articles.length - 1].id : null;

    // Return the total count, articles, and the next cursor
    return {
      total,
      nextCursor,
      articles,
    };
  }
  async createArticleReaction(userId: string, articleId: string) {
    try {
      const article = await this.prismaService.article.findUnique({
        where: {
          id: articleId,
        },
      });
      if (!article) {
        throw new ForbiddenException('Article Not found');
      }

      const reaction = await this.prismaService.articleReaction.create({
        data: {
          reactorId: userId,
          articleId: articleId,
        },
      });
      if (reaction && article.authorId !== userId) {
        this.notificationService.createNotification({
          actorId: userId,
          receiverId: article.authorId,
          entityId: articleId,
          type: 'React',
        });
      }
      return reaction;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'You have already reacted to this article',
          );
        }
      }
      throw error;
    }
  }
  async deleteArticleReaction(userId: string, articleId: string) {
    return this.prismaService.articleReaction.deleteMany({
      where: {
        articleId: articleId,
        reactorId: userId,
      },
    });
  }
}
