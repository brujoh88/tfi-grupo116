// Las formas de lo que contesta la API, con nombre corto. Salen de `esquema.ts`,
// que se genera desde el Swagger con `npm run tipos`: no se escriben a mano, así
// la forma vive en un solo lugar, el back. Si la API cambia, se regenera.
import type { components } from './esquema'

type Esquemas = components['schemas']

export type Opcion = Esquemas['Opcion']
export type Catalogo = Esquemas['Catalogo']
export type ServicioDelCatalogo = Esquemas['ServicioDelCatalogo']
export type ArmarTurno = Esquemas['ArmarTurnoDto']
export type TurnoArmado = Esquemas['TurnoArmado']
export type ConsultarDisponibilidad = Esquemas['ConsultarDisponibilidadDto']
export type Disponibilidad = Esquemas['Disponibilidad']
export type Reservar = Esquemas['ReservarDto']
export type Comprobante = Esquemas['Comprobante']
