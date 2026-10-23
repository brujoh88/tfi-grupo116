import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * El teléfono de la clienta en una sola forma, para que "11 5555-1234" y
 * "+54 9 11 5555 1234" sean la misma clienta. Devuelve `null` si no es un
 * teléfono válido.
 *
 * El formato lo resuelve la librería: el 0 de la característica, el 15, los
 * espacios y los guiones. Lo único propio es sacar el 9 que va después del
 * +54: es el prefijo para llamar a un celular desde el exterior, y la librería
 * lo deja en unos casos sí y en otros no.
 */
export function normalizarTelefono(texto: string): string | null {
  const numero = parsePhoneNumberFromString(texto, 'AR');
  if (!numero?.isValid()) {
    return null;
  }
  return numero.number.replace(/^\+549/, '+54');
}
