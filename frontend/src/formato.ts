// Cómo se muestran los números. Es presentación, no regla del salón: el precio
// y la duración los calcula siempre la API.

export function pesos(monto: number): string {
  return `$${monto.toLocaleString('es-AR')}`
}

export function duracion(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas} h` : `${horas} h ${resto}`
}
