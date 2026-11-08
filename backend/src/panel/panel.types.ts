import { PickType } from '@nestjs/swagger';
import { IsInt, IsPositive, Max, Min } from 'class-validator';
import { ConsultarGrillaDto, TramoAbierto } from '../grilla/grilla.types';

/** El día que la dueña quiere ver, como `2026-11-09`. */
export class VerDiaDto extends PickType(ConsultarGrillaDto, ['fecha']) {}

/** Abrir un tramo de un lugar un día puntual, en minutos desde la medianoche. */
export class AbrirHorarioDto extends PickType(ConsultarGrillaDto, ['fecha']) {
  @IsInt({ message: 'El lugar se identifica con un número entero' })
  @IsPositive({ message: 'El lugar se identifica con un número positivo' })
  lugarId: number;

  /** Desde cuándo, en minutos: 1140 son las 19:00. */
  @IsInt({ message: 'El horario se manda en minutos desde la medianoche' })
  @Min(0, { message: 'El horario no puede ser negativo' })
  @Max(1439, { message: 'El horario tiene que caer dentro del día' })
  desde: number;

  /** Hasta cuándo, en minutos. 1440 es la medianoche del final del día. */
  @IsInt({ message: 'El horario se manda en minutos desde la medianoche' })
  @Min(1, { message: 'El horario tiene que caer dentro del día' })
  @Max(1440, { message: 'El horario tiene que caer dentro del día' })
  hasta: number;
}

/** Un turno tomado, como lo ve la dueña. */
export class ReservaDelPanel {
  id: number;
  inicio: number;
  fin: number;
  clienta: string;
  telefono: string;
  servicio: string;
  extras: string[];
  retiro: string | null;
}

/** Un lugar del salón ese día: qué tiene abierto y qué está tomado. */
export class LugarDelPanel {
  id: number;
  nombre: string;
  /** Sin tramos, ese día está cerrado. */
  tramos: TramoAbierto[];
  reservas: ReservaDelPanel[];
}

export class DiaDelPanel {
  fecha: string;
  lugares: LugarDelPanel[];
}
