import { IsArray, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Opcion } from '../catalogo/catalogo.types';

/**
 * Lo que la clienta armó: qué eligió, por id. Los decoradores comprueban la
 * **forma** —que sean enteros positivos— antes de que esto entre al servicio.
 * Que el servicio exista, esté activo y admita esos extras es una regla del
 * salón, y se comprueba en `TurnosService`.
 */
export class ArmarTurnoDto {
  /** El servicio base. Es obligatorio: un turno sin servicio no existe. */
  @IsInt({ message: 'El servicio se identifica con un número entero' })
  @IsPositive({ message: 'El servicio se identifica con un número positivo' })
  servicioId: number;

  /** Los extras que se le suman. Puede venir vacío o no venir. */
  @IsArray({ message: 'Los extras se mandan en una lista' })
  @IsInt({ each: true, message: 'Cada extra se identifica con un número entero' })
  @IsPositive({
    each: true,
    message: 'Cada extra se identifica con un número positivo',
  })
  extraIds: number[] = [];

  /** El retiro, si lleva. Es a lo sumo uno. */
  @IsOptional()
  @IsInt({ message: 'El retiro se identifica con un número entero' })
  @IsPositive({ message: 'El retiro se identifica con un número positivo' })
  retiroId?: number;
}

/**
 * El turno armado. Devuelve **lo elegido con su nombre y su precio** además de
 * los dos totales, para que la pantalla de confirmación no tenga que rearmarlo
 * ni recalcular nada.
 */
export class TurnoArmado {
  /** El servicio base elegido. */
  servicio: Opcion;

  /** Los extras elegidos, en el orden en que los devuelve el catálogo. */
  extras: Opcion[];

  /** El retiro elegido, o `null` si el turno no lleva. */
  retiro: Opcion | null;

  /** Lo que sale el turno completo, en pesos enteros. */
  precio: number;

  /** Lo que ocupa el turno completo, en minutos. */
  duracionMinutos: number;
}
