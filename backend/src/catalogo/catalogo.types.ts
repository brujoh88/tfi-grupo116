/**
 * La forma de lo que contesta `GET /catalogo`. Es el contrato con las pantallas:
 * está escrito a propósito y no inferido de la base, porque lo que sale por HTTP
 * no es la fila de la tabla. `salonId` y `activo` se quedan adentro.
 */

/** Algo que la clienta puede elegir: un servicio, un extra o un retiro. */
export type Opcion = {
  id: number;
  nombre: string;
  precio: number;
  duracionMinutos: number;
};

/** Un servicio base con los extras que se le pueden sumar. */
export type ServicioDelCatalogo = Opcion & {
  extras: Opcion[];
};

export type Catalogo = {
  servicios: ServicioDelCatalogo[];
  retiros: Opcion[];
};
