import { BadRequestException, Injectable } from '@nestjs/common';
import { AgendaService } from '../agenda/agenda.service';
import { GrillaService } from '../grilla/grilla.service';
import { TurnosService } from '../turnos/turnos.service';
import {
  Disponibilidad,
  ConsultarDisponibilidadDto,
} from './disponibilidad.types';
import { DIAS_HACIA_ADELANTE, Horario, horariosLibres } from './horarios';
import { ahoraEnElSalon, diasEntre } from './reloj';

@Injectable()
export class DisponibilidadService {
  constructor(
    private readonly turnos: TurnosService,
    private readonly grilla: GrillaService,
    private readonly agenda: AgendaService,
  ) {}

  /** Lo que se le muestra a la clienta: los horarios, sin las mesas. */
  async consultar(
    consulta: ConsultarDisponibilidadDto,
  ): Promise<Disponibilidad> {
    const { duracionMinutos, horarios } = await this.libres(consulta);
    return {
      fecha: consulta.fecha,
      duracionMinutos,
      horarios: horarios.map(({ inicio, fin }) => ({ inicio, fin })),
    };
  }

  /**
   * En qué horarios de ese día entra completo el turno armado, y en qué mesas.
   * No calcula nada propio: le pregunta a cada módulo lo suyo y cruza.
   */
  async libres(
    consulta: ConsultarDisponibilidadDto,
  ): Promise<{ duracionMinutos: number; horarios: Horario[] }> {
    const ahora = ahoraEnElSalon();
    const dias = diasEntre(ahora.fecha, consulta.fecha);
    if (dias < 0) {
      throw new BadRequestException('Ese día ya pasó');
    }
    if (dias > DIAS_HACIA_ADELANTE) {
      throw new BadRequestException(
        `Se puede reservar hasta ${DIAS_HACIA_ADELANTE} días adelante`,
      );
    }

    // Cuánto dura lo que armó: lo sabe el armado, que además rechaza una
    // combinación que el catálogo no permite.
    const { duracionMinutos } = await this.turnos.armar(consulta);

    // Qué tiene abierto ese día cada mesa que hace el servicio: lo sabe la grilla.
    const { lugares } = await this.grilla.delDia({
      fecha: consulta.fecha,
      servicioId: consulta.servicioId,
    });

    // Qué tienen ocupado esas mesas: lo sabe la agenda.
    const ocupado = await this.agenda.ocupadoDelDia(
      consulta.fecha,
      lugares.map((l) => l.id),
    );

    const abierto = new Map(lugares.map((l) => [l.id, l.tramos]));
    const desde = dias === 0 ? ahora.minuto : 0;

    return {
      duracionMinutos,
      horarios: horariosLibres(abierto, ocupado, duracionMinutos, desde),
    };
  }
}
