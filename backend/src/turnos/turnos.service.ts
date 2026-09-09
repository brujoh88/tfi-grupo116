import { BadRequestException, Injectable } from '@nestjs/common';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Opcion } from '../catalogo/catalogo.types';
import { ArmarTurnoDto, TurnoArmado } from './turnos.types';

@Injectable()
export class TurnosService {
  constructor(private readonly catalogo: CatalogoService) {}

  /**
   * Dado lo que la clienta eligió, cuánto sale y cuánto dura.
   *
   * No consulta la base: le pide el catálogo a `CatalogoService`, que ya
   * devuelve solo lo activo de este salón y, por cada servicio, solo los extras
   * que se le pueden sumar. Por eso acá no se repite ninguno de esos filtros.
   */
  async armar(elegido: ArmarTurnoDto): Promise<TurnoArmado> {
    const catalogo = await this.catalogo.consultar();

    const servicio = catalogo.servicios.find(
      (s) => s.id === elegido.servicioId,
    );
    if (!servicio) {
      throw new BadRequestException('El servicio elegido no está disponible');
    }

    const extras = this.elegirExtras(
      elegido.extraIds,
      servicio.extras,
      servicio.nombre,
    );
    const retiro = this.elegirRetiro(elegido.retiroId, catalogo.retiros);

    const elegidas: Opcion[] = [
      servicio,
      ...extras,
      ...(retiro ? [retiro] : []),
    ];

    return {
      servicio: this.soloLaOpcion(servicio),
      extras,
      retiro,
      precio: elegidas.reduce((total, o) => total + o.precio, 0),
      duracionMinutos: elegidas.reduce(
        (total, o) => total + o.duracionMinutos,
        0,
      ),
    };
  }

  /**
   * Los extras pedidos, comprobando que cada uno se pueda sumar a este servicio.
   * `compatibles` ya viene filtrado por el catálogo: si un id no está ahí, o no
   * existe, o está dado de baja, o no va con este servicio — para la clienta las
   * tres cosas son lo mismo.
   */
  private elegirExtras(
    pedidos: number[],
    compatibles: Opcion[],
    nombreDelServicio: string,
  ): Opcion[] {
    if (new Set(pedidos).size !== pedidos.length) {
      throw new BadRequestException('Hay un extra repetido en el turno');
    }

    for (const id of pedidos) {
      if (!compatibles.some((extra) => extra.id === id)) {
        throw new BadRequestException(
          `El extra ${id} no se puede sumar a «${nombreDelServicio}»`,
        );
      }
    }

    // Se devuelven en el orden del catálogo y no en el que los mandó la
    // pantalla, para que el mismo turno se vea siempre igual.
    return compatibles
      .filter((extra) => pedidos.includes(extra.id))
      .map((extra) => this.soloLaOpcion(extra));
  }

  /** El retiro pedido, si lo hay. Es a lo sumo uno y tiene que estar activo. */
  private elegirRetiro(
    pedido: number | undefined,
    retiros: Opcion[],
  ): Opcion | null {
    if (pedido === undefined) return null;

    const retiro = retiros.find((r) => r.id === pedido);
    if (!retiro) {
      throw new BadRequestException('El retiro elegido no está disponible');
    }
    return retiro;
  }

  /**
   * Un servicio del catálogo trae sus extras adentro; acá viaja como una opción
   * más, sin esa lista. Devolver el servicio entero repetiría los extras del
   * salón dentro del turno armado.
   */
  private soloLaOpcion({
    id,
    nombre,
    precio,
    duracionMinutos,
  }: Opcion): Opcion {
    return { id, nombre, precio, duracionMinutos };
  }
}
