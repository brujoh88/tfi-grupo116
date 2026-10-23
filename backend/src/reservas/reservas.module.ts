import { Module } from '@nestjs/common';
import { AgendaModule } from '../agenda/agenda.module';
import { DisponibilidadModule } from '../disponibilidad/disponibilidad.module';
import { TurnosModule } from '../turnos/turnos.module';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

/**
 * El trámite de reservar. No es dueño de ninguna tabla: el armado le dice el
 * precio, la disponibilidad si el horario entra y en qué mesas, y la agenda
 * guarda (ADR-008).
 */
@Module({
  imports: [TurnosModule, DisponibilidadModule, AgendaModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
