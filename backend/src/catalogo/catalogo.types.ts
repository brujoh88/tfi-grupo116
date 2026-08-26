/**
 * La forma de lo que contesta `GET /catalogo`. Es el contrato con las pantallas:
 * está escrito a propósito y no inferido de la base, porque lo que sale por HTTP
 * no es la fila de la tabla. `salonId` y `activo` se quedan adentro.
 *
 * Son clases y no `type` porque de acá sale la documentación de la API: un
 * `type` de TypeScript se borra al compilar y Swagger no tendría qué leer.
 */

/** Algo que la clienta puede elegir: un servicio, un extra o un retiro. */
export class Opcion {
  id: number;
  nombre: string;
  precio: number;
  duracionMinutos: number;
}

/** Un servicio base con los extras que se le pueden sumar. */
export class ServicioDelCatalogo extends Opcion {
  extras: Opcion[];
}

export class Catalogo {
  servicios: ServicioDelCatalogo[];
  retiros: Opcion[];
}
