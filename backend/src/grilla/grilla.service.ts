import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalonActualService } from '../salon/salon-actual.service';
import { abiertoElDia } from './franjas';
import { ConsultarGrillaDto, GrillaDelDia } from './grilla.types';

const CAMPOS_DEL_TRAMO = { desdeMinuto: true, hastaMinuto: true } as const;

@Injectable()
export class GrillaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salon: SalonActualService,
  ) {}

  /**
   * Qué tiene abierto cada lugar del salón un día: la plantilla de ese día de la
   * semana, más lo que la dueña abrió, menos lo que cerró. Si viene un servicio,
   * solo los lugares que lo hacen.
   *
   * Es el único lugar que lee `LugarServicio`: la disponibilidad pregunta acá
   * qué lugares hacen un servicio, no consulta la tabla (regla 2).
   */
  async delDia({
    fecha,
    servicioId,
  }: ConsultarGrillaDto): Promise<GrillaDelDia> {
    // Medianoche UTC a propósito: así el día de la semana y la comparación con
    // la columna `DATE` no dependen del huso horario del servidor.
    const dia = new Date(`${fecha}T00:00:00Z`);

    const lugares = await this.prisma.lugar.findMany({
      where: {
        salonId: this.salon.id(),
        activo: true,
        ...(servicioId && { servicios: { some: { servicioId } } }),
      },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        franjas: {
          where: { diaSemana: dia.getUTCDay() },
          select: CAMPOS_DEL_TRAMO,
        },
        excepciones: {
          where: { fecha: dia },
          select: { ...CAMPOS_DEL_TRAMO, tipo: true },
        },
      },
    });

    return {
      fecha,
      lugares: lugares.map(({ id, nombre, franjas, excepciones }) => ({
        id,
        nombre,
        tramos: abiertoElDia(
          franjas.map(comoTramo),
          excepciones.filter((e) => e.tipo === 'ABRE').map(comoTramo),
          excepciones.filter((e) => e.tipo === 'CIERRA').map(comoTramo),
        ),
      })),
    };
  }
}

/** La fila de la base habla de `desdeMinuto`; la cuenta, de tramos. */
function comoTramo(fila: { desdeMinuto: number; hastaMinuto: number }) {
  return { desde: fila.desdeMinuto, hasta: fila.hastaMinuto };
}
