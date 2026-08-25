import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalonActualService } from '../salon/salon-actual.service';
import { Catalogo } from './catalogo.types';

/** Los campos que salen por HTTP. Los que no están acá, no viajan. */
const CAMPOS_DE_LA_OPCION = {
  id: true,
  nombre: true,
  precio: true,
  duracionMinutos: true,
} as const;

@Injectable()
export class CatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salon: SalonActualService,
  ) {}

  /** Todo lo que la clienta puede elegir hoy en este salón. */
  async consultar(): Promise<Catalogo> {
    const salonId = this.salon.id();

    const [servicios, retiros] = await Promise.all([
      this.prisma.servicio.findMany({
        where: { salonId, activo: true },
        orderBy: { nombre: 'asc' },
        select: {
          ...CAMPOS_DE_LA_OPCION,
          extras: {
            // Un extra desactivado no se ofrece, aunque el vínculo siga cargado.
            where: { extra: { activo: true } },
            orderBy: { extra: { nombre: 'asc' } },
            select: { extra: { select: CAMPOS_DE_LA_OPCION } },
          },
        },
      }),
      this.prisma.retiro.findMany({
        where: { salonId, activo: true },
        orderBy: { nombre: 'asc' },
        select: CAMPOS_DE_LA_OPCION,
      }),
    ]);

    return {
      // La tabla de vínculo es asunto de la base: afuera sale la lista de extras.
      servicios: servicios.map(({ extras, ...servicio }) => ({
        ...servicio,
        extras: extras.map((vinculo) => vinculo.extra),
      })),
      retiros,
    };
  }
}
