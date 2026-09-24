import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';

/**
 * Qué día se consulta y, si se quiere, para qué servicio. Llega por query
 * string, así que todo viene como texto: `@Type` convierte el servicio a número
 * antes de validarlo.
 */
export class ConsultarGrillaDto {
  /** El día, como `2026-10-14`. Sin hora: la grilla es por día. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha va como año-mes-día, por ejemplo 2026-10-14',
  })
  @IsISO8601(
    { strict: true },
    { message: 'La fecha no es un día del calendario' },
  )
  fecha: string;

  /** Si viene, solo se devuelven los lugares que hacen este servicio. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El servicio se identifica con un número entero' })
  @IsPositive({ message: 'El servicio se identifica con un número positivo' })
  servicioId?: number;
}

/** Un tramo abierto, en minutos desde la medianoche: de 9 a 13 es 540–780. */
export class TramoAbierto {
  desde: number;
  hasta: number;
}

/** Un lugar y lo que tiene abierto ese día. Sin tramos, está cerrado. */
export class LugarDelDia {
  id: number;
  nombre: string;
  tramos: TramoAbierto[];
}

export class GrillaDelDia {
  fecha: string;
  lugares: LugarDelDia[];
}
