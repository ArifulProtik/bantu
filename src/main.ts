import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthenticationGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new AuthenticationGuard(reflector, app.get(AuthService)));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
