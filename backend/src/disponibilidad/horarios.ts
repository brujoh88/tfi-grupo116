import { abiertoElDia, Tramo } from '../grilla/franjas';

/** Cada cuántos minutos se ofrece un horario de inicio: 9:00, 9:30, 10:00… */
export const PASO_MINUTOS = 30;

/** Hasta cuántos días adelante se puede reservar. */
export const DIAS_HACIA_ADELANTE = 45;

/** Un horario que se le puede ofrecer a la clienta, y en qué lugares entra. */
export interface Horario {
  inicio: number;
  fin: number;
  lugarIds: number[];
}

/**
 * En qué horarios entra completo un turno de `duracion` minutos, mirando todos
 * los lugares que hacen el servicio. Un horario se ofrece si entra en **alguno**:
 * la clienta no elige la mesa.
 *
 * Lo libre de cada lugar es lo abierto menos lo reservado: la misma resta que
 * usa la grilla para los cierres, así que se reusa. Los inicios van alineados al
 * reloj —9:00, 9:30— y no se ofrece nada antes de `desde` (los minutos que ya
 * pasaron, si es hoy).
 */
export function horariosLibres(
  abiertoPorLugar: Map<number, Tramo[]>,
  ocupadoPorLugar: Map<number, Tramo[]>,
  duracion: number,
  desde = 0,
): Horario[] {
  const lugaresPorInicio = new Map<number, number[]>();

  for (const [lugarId, abierto] of abiertoPorLugar) {
    const libre = abiertoElDia(abierto, [], ocupadoPorLugar.get(lugarId) ?? []);

    for (const tramo of libre) {
      const primero = Math.max(tramo.desde, desde);
      let inicio = Math.ceil(primero / PASO_MINUTOS) * PASO_MINUTOS;

      // Entra solo si termina adentro del tramo libre: completo, o nada.
      for (; inicio + duracion <= tramo.hasta; inicio += PASO_MINUTOS) {
        const lugares = lugaresPorInicio.get(inicio) ?? [];
        lugares.push(lugarId);
        lugaresPorInicio.set(inicio, lugares);
      }
    }
  }

  return [...lugaresPorInicio]
    .sort(([a], [b]) => a - b)
    .map(([inicio, lugarIds]) => ({
      inicio,
      fin: inicio + duracion,
      lugarIds,
    }));
}
