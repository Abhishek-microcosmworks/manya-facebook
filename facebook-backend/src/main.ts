import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLogger } from './common/services/logger.service';
import { RuntimeExceptionFilter } from './middlewares';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { BootstrapService } from './bootstrap.service';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'debug', 'warn'],
  });

  app.setGlobalPrefix('api');

  const corsOptions: CorsOptions = {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.useLogger(app.get(CustomLogger));

  app.useGlobalFilters(new RuntimeExceptionFilter(app.get(CustomLogger)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Nest JS Starter API Documentation')
    .setDescription('API for managing NestJS starter platform resources.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/api/swagger', app, document);

  app.setViewEngine('ejs');
  app.setBaseViewsDir(path.join(__dirname, '..', '..', 'views'));

  await app.get(BootstrapService).createAdmin();

  // welcome page for the root URL
  app.getHttpAdapter().get('/', (req, res: Response) => {
    res.status(200).send('Welcome to NestJS Starter API');
  });

  const PORT = parseInt(process.env.SERVER_PORT) || 4000;

  console.log(`\nlistening on PORT : ${PORT}...\n`);

  await app.listen(PORT);
  console.log(`Application is running on http://localhost:${PORT}`);
}

bootstrap();
