import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgendaService } from './agenda.service';

// Dueño de `Clienta`, `Reserva` y `ReservaExtra`. Está abajo de la disponibilidad
// y de la reserva, y no depende de ninguna de las dos: así no hay círculo.
// No tiene controller: nadie de afuera le habla directo.
@Module({
  imports: [PrismaModule],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}
