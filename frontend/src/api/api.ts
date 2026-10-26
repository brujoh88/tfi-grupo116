// El único lugar del front que le habla a la API. Las pantallas llaman a estas
// funciones y no saben de URLs, de `fetch` ni de cómo vienen los errores.
import type { ArmarTurno, Catalogo, TurnoArmado } from './tipos'

// Dónde está la API: `localhost` para desarrollar, Railway en producción.
const API_URL = import.meta.env.VITE_API_URL

/**
 * La API contestó con un error (400, 409…). Trae los mensajes tal como los
 * escribió el back, que ya están pensados para mostrárselos a la clienta.
 */
export class ErrorDeLaApi extends Error {
  readonly estado: number
  readonly mensajes: string[]

  constructor(estado: number, mensajes: string[]) {
    super(mensajes.join('. '))
    this.estado = estado
    this.mensajes = mensajes
  }
}

async function pedir<T>(ruta: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: cuerpo === undefined ? 'GET' : 'POST',
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  })
  const datos = await respuesta.json()
  if (!respuesta.ok) {
    // Nest manda `message` como texto, o como lista si fallaron varios campos.
    const { message } = datos as { message: string | string[] }
    throw new ErrorDeLaApi(respuesta.status, Array.isArray(message) ? message : [message])
  }
  return datos as T
}

export const pedirCatalogo = () => pedir<Catalogo>('/catalogo')

export const armarTurno = (elegido: ArmarTurno) =>
  pedir<TurnoArmado>('/turnos/armado', elegido)
