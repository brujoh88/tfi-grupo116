// Cómo se muestran los números. Es presentación, no regla del salón: el precio
// y la duración los calcula siempre la API.

export function pesos(monto: number): string {
  return `$${monto.toLocaleString('es-AR')}`
}

/** Minutos desde la medianoche, como en la API: 900 → "15:00". */
export function hora(minutos: number): string {
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0')
  const mm = String(minutos % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/** "2026-11-09" → "lunes 9 de noviembre". Se arma a mediodía para que el huso
 *  del celular no lo corra al día anterior. */
export function dia(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function duracion(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas} h` : `${horas} h ${resto}`
}
