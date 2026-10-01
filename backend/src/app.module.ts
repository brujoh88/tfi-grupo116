import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogoModule } from './catalogo/catalogo.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { GrillaModule } from './grilla/grilla.module';
import { HealthModule } from './health/health.module';
import { TurnosModule } from './turnos/turnos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    CatalogoModule,
    TurnosModule,
    GrillaModule,
    DisponibilidadModule,
  ],
})
export class AppModule {}
