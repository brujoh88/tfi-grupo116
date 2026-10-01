import { Injectable } from '@nestjs/common';
import { Tramo } from '../grilla/franjas';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Qué tiene ocupado cada lugar un día: los tramos de sus reservas, por lugar.
   * Un lugar sin reservas no aparece en el mapa.
   *
   * Es el único lugar que lee `Reserva`: la disponibilidad pregunta acá qué está
   * tomado, no consulta la tabla (regla 2).
   */
  async ocupadoDelDia(
    fecha: string,
    lugarIds: number[],
  ): Promise<Map<number, Tramo[]>> {
    const reservas = await this.prisma.reserva.findMany({
      where: {
        // Medianoche UTC, igual que en la grilla: la columna es un `DATE`.
        fecha: new Date(`${fecha}T00:00:00Z`),
        lugarId: { in: lugarIds },
      },
      select: { lugarId: true, inicioMinuto: true, finMinuto: true },
    });

    const ocupado = new Map<number, Tramo[]>();
    for (const { lugarId, inicioMinuto, finMinuto } of reservas) {
      const tramos = ocupado.get(lugarId) ?? [];
      tramos.push({ desde: inicioMinuto, hasta: finMinuto });
      ocupado.set(lugarId, tramos);
    }
    return ocupado;
  }
}
