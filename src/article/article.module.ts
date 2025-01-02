import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/notification/notification.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [NotificationModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
