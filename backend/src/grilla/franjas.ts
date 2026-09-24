/** Un tramo del día, en minutos desde la medianoche: de 9 a 13 es 540–780. */
export interface Tramo {
  desde: number;
  hasta: number;
}

/**
 * Lo que un lugar tiene abierto un día: la plantilla, más lo que se abrió,
 * menos lo que se cerró.
 *
 * Si un cierre y una apertura se pisan, **gana el cierre**. El panel no va a
 * dejar cargar las dos cosas sobre el mismo horario, pero si llegaran a
 * convivir, ofrecer un horario de menos es un error que la dueña corrige;
 * ofrecer uno de más es una clienta que llega y no la atiende nadie.
 */
export function abiertoElDia(
  plantilla: Tramo[],
  abiertos: Tramo[],
  cerrados: Tramo[],
): Tramo[] {
  return cerrados.reduce(restar, unir([...plantilla, ...abiertos]));
}

/**
 * Junta los tramos que se pisan o se tocan: 9–11 y 10–13 dan 9–13, y también
 * 9–10 y 10–11 dan 9–11. Si no se juntaran, un turno que cruza las 10 no
 * entraría en ninguno de los dos aunque el lugar esté abierto sin cortes.
 */
function unir(tramos: Tramo[]): Tramo[] {
  const ordenados = [...tramos].sort((a, b) => a.desde - b.desde);
  const unidos: Tramo[] = [];

  for (const tramo of ordenados) {
    const ultimo = unidos.at(-1);
    if (ultimo && tramo.desde <= ultimo.hasta) {
      ultimo.hasta = Math.max(ultimo.hasta, tramo.hasta);
    } else {
      unidos.push({ ...tramo });
    }
  }
  return unidos;
}

/** Saca un cierre de los tramos abiertos: 9–13 menos 10–11 da 9–10 y 11–13. */
function restar(abiertos: Tramo[], cierre: Tramo): Tramo[] {
  return abiertos.flatMap((tramo) => {
    const quedan: Tramo[] = [];
    if (tramo.desde < cierre.desde) {
      quedan.push({
        desde: tramo.desde,
        hasta: Math.min(tramo.hasta, cierre.desde),
      });
    }
    if (tramo.hasta > cierre.hasta) {
      quedan.push({
        desde: Math.max(tramo.desde, cierre.hasta),
        hasta: tramo.hasta,
      });
    }
    return quedan;
  });
}
