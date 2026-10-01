/**
 * El huso del salón. El servidor corre en Virginia y su reloj está en UTC: si se
 * usara ese, a las 22 de Argentina ya sería "mañana" y los horarios de la noche
 * figurarían como pasados.
 */
export const ZONA_DEL_SALON = 'America/Argentina/Buenos_Aires';

/** Qué día es y cuántos minutos pasaron desde la medianoche, en el salón. */
export function ahoraEnElSalon(instante: Date = new Date()): {
  fecha: string;
  minuto: number;
} {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA_DEL_SALON,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(instante)
      .map((p) => [p.type, p.value]),
  );
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    minuto: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

/** Cuántos días hay de `desde` a `hasta`, las dos como `2026-10-14`. */
export function diasEntre(desde: string, hasta: string): number {
  const dia = (fecha: string) => Date.parse(`${fecha}T00:00:00Z`);
  return Math.round((dia(hasta) - dia(desde)) / 86_400_000);
}
