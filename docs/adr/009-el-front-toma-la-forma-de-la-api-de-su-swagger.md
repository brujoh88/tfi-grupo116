# ADR-009: El frontend toma la forma de la API de su Swagger

- **Estado**: Aceptado
- **Fecha**: 2026-10-26
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El frontend está en TypeScript para que un error de forma —la pantalla espera
`precio` y la API manda `total`— aparezca al compilar y no cuando una clienta
aprieta un botón. Para eso el frontend tiene que conocer la forma de cada
respuesta de la API: `Catalogo`, `TurnoArmado`, `Disponibilidad`, `Comprobante`.

Esa forma ya está escrita una vez, en las clases de salida del backend. La
pregunta es cómo llega al frontend sin romper el
[ADR-001](001-dos-aplicaciones-separadas.md): las dos aplicaciones se hablan
solo por HTTP.

## Decisión

**Los tipos del frontend se generan desde el Swagger de la API.** El comando
`npm run tipos` lee `/docs-json` con `openapi-typescript` y escribe
`frontend/src/api/esquema.ts`. Ese archivo no se edita a mano y se commitea, así
el frontend compila sin la API corriendo. `src/api/tipos.ts` solo les da
nombres cortos.

El contrato entre las dos aplicaciones es, entonces, la documentación de la
API: la misma que se prueba a mano en `/docs`.

## Consecuencias

**A favor**

- **La forma vive en un solo lugar**, el backend. Si una clase de salida cambia,
  se regenera y el frontend deja de compilar exactamente donde usa lo que cambió.
- **No se cruza código entre las aplicaciones**: el frontend toma la forma por
  HTTP, igual que los datos.
- Se apoya en algo que ya existía: la regla de que lo que devuelve un endpoint
  sea una clase y no un `type` hizo que el Swagger ya trajera todas las formas,
  con sus descripciones.

**En contra — asumido a conciencia**

- **Hay que acordarse de regenerar.** Si la API cambia y nadie corre el comando,
  el frontend compila contra la forma vieja.
- **Una herramienta más.** No se pudo instalar como dependencia —pide
  TypeScript 5 y el frontend usa el 6—, así que el comando la corre con `npx` y
  versión fija.
- **El tipo dice lo que la API promete, no lo que contesta.** Si el Swagger
  describe mal una respuesta, el frontend confía igual.

## Las alternativas consideradas

**Escribir los tipos a mano en el frontend.** Lo más simple, sin herramientas.
Se descartó porque la forma quedaría en dos lugares, y una copia que se
desincroniza no avisa: el error aparece recién en el navegador, que es lo que
TypeScript venía a evitar.

**Importar las clases desde `../backend/src`.** Una sola forma y sin generar
nada. Se descartó porque es exactamente lo que el ADR-001 prohíbe: el día que el
frontend importa código del backend, dejan de ser dos aplicaciones aunque las
carpetas sigan separadas. Además arrastraría al frontend los decoradores de Nest.
