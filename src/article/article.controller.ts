import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/auth-metadata.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  DeleteArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  createArticle(
    @GetUser('id') userid: string,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articleService.createArticle(userid, createArticleDto);
  }
  @Put()
  updateArticle(
    @GetUser('id') userid: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(userid, updateArticleDto);
  }
  @Delete()
  deleteArticle(
    @GetUser('id') userid: string,
    @Body() deleteArticleDto: DeleteArticleDto,
  ) {
    return this.articleService.deleteArticle(userid, deleteArticleDto.id);
  }
  @Public()
  @Get(':slug')
  findArticleById(@Param() slug: { slug: string }) {
    return this.articleService.findArticleBySlug(slug?.slug);
  }
  @Public()
  @Get()
  findAllArticles(
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.articleService.findAllArticles(cursor, limit);
  }

  @Public()
  @Get('author/:username')
  findArticlesByAuthor(
    @Param('username') username: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.articleService.findAllArticlesByAuthorUsername(
      username,
      cursor,
      limit,
    );
  }
  @Post('react')
  reactToArticle(@GetUser('id') userid: string, @Body('id') id: string) {
    return this.articleService.createArticleReaction(userid, id);
  }
  @Delete('react')
  deleteReaction(@GetUser('id') userid: string, @Body('id') id: string) {
    return this.articleService.deleteArticleReaction(userid, id);
  }
}
