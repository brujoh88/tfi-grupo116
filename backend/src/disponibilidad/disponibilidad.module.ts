import { Module } from '@nestjs/common';
import { AgendaModule } from '../agenda/agenda.module';
import { GrillaModule } from '../grilla/grilla.module';
import { TurnosModule } from '../turnos/turnos.module';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';

/**
 * En qué horarios entra un turno armado. No es dueño de ninguna tabla: cruza lo
 * que le contestan el armado (cuánto dura), la grilla (qué está abierto) y la
 * agenda (qué está ocupado).
 */
@Module({
  imports: [TurnosModule, GrillaModule, AgendaModule],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}
