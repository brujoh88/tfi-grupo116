import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Opcion } from '../catalogo/catalogo.types';
import { ConsultarDisponibilidadDto } from '../disponibilidad/disponibilidad.types';

/**
 * Lo que manda la clienta al confirmar: lo que armó y el día, como en la
 * disponibilidad, más el horario que eligió, quién es y el total que vio.
 */
export class ReservarDto extends ConsultarDisponibilidadDto {
  /** El horario elegido, en minutos desde la medianoche: 900 son las 15:00. */
  @IsInt({ message: 'El horario se manda en minutos desde la medianoche' })
  @Min(0, { message: 'El horario no puede ser negativo' })
  @Max(1439, { message: 'El horario tiene que caer dentro del día' })
  inicio: number;

  @IsString({ message: 'El nombre va como texto' })
  @IsNotEmpty({ message: 'Falta el nombre' })
  nombre: string;

  /** Como lo escriba la clienta: la API lo lleva a una sola forma. */
  @IsString({ message: 'El teléfono va como texto' })
  @IsNotEmpty({ message: 'Falta el teléfono' })
  telefono: string;

  /**
   * El total que se le mostró. No se guarda: la API vuelve a calcularlo y, si
   * no coincide, no reserva (el precio cambió en el medio).
   */
  @IsInt({ message: 'El total se manda en pesos enteros' })
  @Min(0, { message: 'El total no puede ser negativo' })
  total: number;
}

/**
 * Lo que se le muestra a la clienta después de reservar. Los precios son los que
 * quedaron copiados en la reserva. No dice la mesa: a la clienta no le importa.
 */
export class Comprobante {
  /** El número de la reserva. */
  id: number;

  nombre: string;

  fecha: string;

  /** En minutos desde la medianoche. */
  inicio: number;

  fin: number;

  servicio: Opcion;

  extras: Opcion[];

  retiro: Opcion | null;

  /** Lo que sale el turno completo, en pesos enteros. */
  precio: number;
}
