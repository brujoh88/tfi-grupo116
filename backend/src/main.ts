import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Comprueba la forma de lo que llega antes de que entre a ningún servicio.
  // `whitelist` descarta los campos que el DTO no declara, y `transform`
  // convierte el JSON crudo en la clase del DTO para que los decoradores corran.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

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
