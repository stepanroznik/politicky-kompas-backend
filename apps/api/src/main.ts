import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import appConfig from './config/app.config';
import { runMigrations } from './migrations/migration-runner';

async function bootstrap() {
    await runMigrations();
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.setGlobalPrefix('api');

    const apiSpec = new DocumentBuilder()
        .setTitle('Politický Kompas')
        .setDescription('Politický Kompas API')
        .setVersion('1.0')
        .addSecurity('ApiKeyAuth', {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
        })
        .addSecurityRequirements('ApiKeyAuth')
        .build();
    const document = SwaggerModule.createDocument(app, apiSpec);
    SwaggerModule.setup('api', app, document);

    // Serve the built frontend from the sibling dist/apps/frontend directory.
    // When running the compiled API (dist/apps/api/main.js), __dirname points to dist/apps/api,
    // so navigating up two levels reaches dist/apps/frontend.
    const frontendDist = join(__dirname, '..', '..', 'frontend');
    app.use(express.static(frontendDist));

    const logger = (await app.resolve(LoggerService)).setContext('Main');
    const PORT = app.get<ConfigType<typeof appConfig>>(appConfig.KEY).app.port;

    await app.listen(PORT);
    logger.info(`Server started on port ${PORT}`);
}
bootstrap();
