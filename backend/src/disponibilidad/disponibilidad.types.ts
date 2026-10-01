import { IsISO8601, Matches } from 'class-validator';
import { ArmarTurnoDto } from '../turnos/turnos.types';

/**
 * Lo que la clienta armó, más el día que quiere. Hereda del armado la forma del
 * servicio, los extras y el retiro: la disponibilidad necesita lo mismo para
 * saber cuánto dura el turno.
 */
export class ConsultarDisponibilidadDto extends ArmarTurnoDto {
  /** El día, como `2026-10-14`. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha va como año-mes-día, por ejemplo 2026-10-14',
  })
  @IsISO8601(
    { strict: true },
    { message: 'La fecha no es un día del calendario' },
  )
  fecha: string;
}

/** Un horario que se le ofrece a la clienta, en minutos desde la medianoche. */
export class HorarioOfrecido {
  inicio: number;
  fin: number;
}

/**
 * Los horarios de ese día donde el turno entra completo. No dice en qué mesa:
 * eso lo decide la reserva al guardar.
 */
export class Disponibilidad {
  fecha: string;

  /** Lo que dura el turno armado, en minutos. */
  duracionMinutos: number;

  horarios: HorarioOfrecido[];
}
