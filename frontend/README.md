# Frontend

Las pantallas de la clienta y el panel del salón, en **React con Vite**,
TypeScript y Tailwind. Pensadas para el celular.

Es una aplicación separada de la API: se comunica con ella solo por HTTP y no
calcula nada del negocio —pregunta—. El porqué está en el
[ADR-001](../docs/adr/001-dos-aplicaciones-separadas.md).

## Cómo está armado

- **Una ruta por pantalla** (`react-router`), para que "atrás" en el celular
  vuelva al paso anterior en vez de sacar a la clienta del sitio. Lo que va
  eligiendo vive en `App.tsx`, arriba de las rutas.
- **`src/api/api.ts` es el único lugar que le habla a la API.** La dirección sale
  de `VITE_API_URL` (ver `.env.example`).
- **Los tipos de lo que contesta la API no se escriben a mano**: `src/api/esquema.ts`
  se genera desde el Swagger con `npm run tipos`. El porqué está en el
  [ADR-009](../docs/adr/009-el-front-toma-la-forma-de-la-api-de-su-swagger.md).

## Las pantallas

| Ruta | Pantalla | Estado |
|---|---|---|
| `/armar` | Armar el turno, con el total en vivo | Hecha |
| `/horario` | Elegir día y hora | Prevista |
| — | Confirmar y comprobante | Previstas |
| — | Panel del salón, con su clave | Previsto |

Para levantarlo, ver la instalación en el [README](../README.md#instalación).
