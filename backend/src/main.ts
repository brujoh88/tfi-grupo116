import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuracion = new DocumentBuilder()
    .setTitle('API de turnos')
    .setDescription(
      'La API del sistema de turnos. Se prueba desde acá: cada endpoint tiene ' +
        'un "Try it out" que pega contra esta misma instancia.',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, configuracion),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
