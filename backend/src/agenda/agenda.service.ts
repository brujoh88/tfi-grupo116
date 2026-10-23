import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { Tramo } from '../grilla/franjas';
import { PrismaService } from '../prisma/prisma.service';
import { SalonActualService } from '../salon/salon-actual.service';
import { normalizarTelefono } from './telefono';

/** Una reserva ya decidida: qué mesa, qué horario y qué se cobró de cada cosa. */
export interface NuevaReserva {
  telefono: string;
  nombre: string;
  fecha: string;
  lugarId: number;
  inicioMinuto: number;
  finMinuto: number;
  servicio: { id: number; precio: number };
  extras: { id: number; precio: number }[];
  retiro: { id: number; precio: number } | null;
}

/**
 * La base rechazó la reserva porque se superpone con otra de la misma mesa
 * (ADR-007). No dice nada de HTTP: el que reserva decide qué contestar.
 */
export class HorarioOcupadoError extends Error {}

/** El código de Postgres para una restricción `EXCLUDE` violada. */
const SE_SUPERPONE = '23P01';

@Injectable()
export class AgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salon: SalonActualService,
  ) {}

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

  /**
   * Guarda la reserva y su clienta, todo o nada. Si el teléfono ya es de una
   * clienta, se le pone el nombre que llegó: gana el último.
   *
   * No decide si el horario entra: eso lo preguntó antes la reserva. Lo que sí
   * garantiza la base es que dos reservas no se pisen, aunque lleguen a la vez.
   */
  async guardar(reserva: NuevaReserva): Promise<number> {
    const telefono = normalizarTelefono(reserva.telefono);
    if (!telefono) {
      throw new BadRequestException(
        'Revisá el teléfono: no es un número válido',
      );
    }
    const salonId = this.salon.id();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const clienta = await tx.clienta.upsert({
          where: { salonId_telefono: { salonId, telefono } },
          create: { salonId, telefono, nombre: reserva.nombre },
          update: { nombre: reserva.nombre },
        });

        const { id } = await tx.reserva.create({
          data: {
            clientaId: clienta.id,
            fecha: new Date(`${reserva.fecha}T00:00:00Z`),
            lugarId: reserva.lugarId,
            inicioMinuto: reserva.inicioMinuto,
            finMinuto: reserva.finMinuto,
            servicioId: reserva.servicio.id,
            servicioPrecio: reserva.servicio.precio,
            retiroId: reserva.retiro?.id ?? null,
            retiroPrecio: reserva.retiro?.precio ?? null,
            extras: {
              create: reserva.extras.map((e) => ({
                extraId: e.id,
                precio: e.precio,
              })),
            },
          },
        });
        return id;
      });
    } catch (error) {
      if (seSuperpone(error)) {
        throw new HorarioOcupadoError();
      }
      throw error;
    }
  }
}

/**
 * Prisma no tiene un código propio para `EXCLUDE`: el de Postgres viene
 * adentro del error del adaptador.
 */
function seSuperpone(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }
  const meta = error.meta as
    { driverAdapterError?: { cause?: { originalCode?: string } } } | undefined;
  return meta?.driverAdapterError?.cause?.originalCode === SE_SUPERPONE;
}
