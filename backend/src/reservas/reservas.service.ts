import { ConflictException, Injectable } from '@nestjs/common';
import { AgendaService, HorarioOcupadoError } from '../agenda/agenda.service';
import { DisponibilidadService } from '../disponibilidad/disponibilidad.service';
import { TurnosService } from '../turnos/turnos.service';
import { Comprobante, ReservarDto } from './reservas.types';

@Injectable()
export class ReservasService {
  constructor(
    private readonly turnos: TurnosService,
    private readonly disponibilidad: DisponibilidadService,
    private readonly agenda: AgendaService,
  ) {}

  /**
   * El trámite de reservar. No decide nada propio: el precio lo sabe el armado,
   * si el horario entra lo sabe la disponibilidad, y que no se lo lleven dos lo
   * garantiza la base.
   */
  async reservar(pedido: ReservarDto): Promise<Comprobante> {
    // El precio se congela acá, contra el que vio la clienta (PDR-004).
    const armado = await this.turnos.armar(pedido);
    if (armado.precio !== pedido.total) {
      throw new ConflictException(
        `El precio cambió: ahora sale $${armado.precio}. Revisalo y confirmá de nuevo`,
      );
    }

    const { horarios } = await this.disponibilidad.libres(pedido);
    const horario = horarios.find((h) => h.inicio === pedido.inicio);
    if (!horario) {
      throw new ConflictException('Ese horario ya no está disponible');
    }

    // Va a la mesa de número más chico. Si otra clienta la tomó en el medio, la
    // base la rebota y se prueba la siguiente: la primera que de verdad está libre.
    const lugarIds = [...horario.lugarIds].sort((a, b) => a - b);
    let id: number | undefined;
    for (const lugarId of lugarIds) {
      try {
        id = await this.agenda.guardar({
          telefono: pedido.telefono,
          nombre: pedido.nombre,
          fecha: pedido.fecha,
          lugarId,
          inicioMinuto: horario.inicio,
          finMinuto: horario.fin,
          servicio: armado.servicio,
          extras: armado.extras,
          retiro: armado.retiro,
        });
        break;
      } catch (error) {
        if (!(error instanceof HorarioOcupadoError)) {
          throw error;
        }
      }
    }
    // Las tomaron todas entre la consulta y el guardado (ADR-007).
    if (id === undefined) {
      throw new ConflictException('Ese horario se acaba de ocupar');
    }

    return {
      id,
      nombre: pedido.nombre,
      fecha: pedido.fecha,
      inicio: horario.inicio,
      fin: horario.fin,
      servicio: armado.servicio,
      extras: armado.extras,
      retiro: armado.retiro,
      precio: armado.precio,
    };
  }
}
