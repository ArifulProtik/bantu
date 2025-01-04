import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/notification.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [SocketModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
