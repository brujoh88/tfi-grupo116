# Arquitectura y módulos

Cómo está armado el sistema, qué hace cada módulo y cómo se conectan entre sí.
Se actualiza a medida que se construye: **lo que dice acá es lo que existe**, y
lo previsto está marcado como tal.

La decisión de fondo —por qué son dos aplicaciones y no una— está en
[`adr/001-dos-aplicaciones-separadas.md`](adr/001-dos-aplicaciones-separadas.md).

## Las dos aplicaciones

| Aplicación | Qué es | Qué hace |
|---|---|---|
| `backend/` | API en NestJS | Contesta preguntas y guarda decisiones. **Toda regla de negocio vive acá** |
| `frontend/` *(previsto)* | React con Vite | Muestra y pregunta. No calcula nada del negocio |

Se comunican **solo por HTTP**. El frontend nunca importa código del backend: si
lo hiciera, dejarían de ser dos aplicaciones aunque las carpetas siguieran ahí.

## Qué arquitectura es esta

**Un monolito modular por dominio, con capas dentro de cada módulo.**

- **Monolito**: una sola aplicación de backend, un solo despliegue, una sola base
  de datos. Las *dos aplicaciones* del ADR-001 son el backend y el frontend; el
  backend es uno.
- **Modular por dominio**: se parte por área del negocio —catálogo, turnos,
  grilla, disponibilidad, reservas—, no por tipo de archivo.
- **En capas, adentro de cada módulo**: el controller traduce HTTP y no calcula,
  el service tiene las reglas, Prisma accede a los datos.
- **Sin capa de repositorio**: el service consulta Prisma directamente.

Se descartaron hexagonal, las capas globales, los microservicios y *serverless*.
El porqué de cada una está en el
[ADR-004](adr/004-monolito-modular-por-dominio.md).

## Reglas de dependencia entre módulos

Las flechas del mapa dicen qué depende de qué. Estas reglas dicen **qué está
prohibido**, que es lo que un dibujo no puede decir:

| # | Regla | Qué evita |
|---|---|---|
| 1 | Un módulo de negocio **puede** usar el service de otro, si ese módulo lo exporta | Que cada uno reimplemente lo que otro ya sabe contestar |
| 2 | **Ningún módulo consulta tablas que no son suyas** | La misma regla de negocio escrita en dos lugares |
| 3 | **No hay dependencias circulares** | Módulos que no se pueden entender, explicar ni probar por separado. Nest además no arranca |
| 4 | **La infraestructura no depende del negocio** | Que `PrismaModule` o `SalonModule` tengan que saber que existe el catálogo |

**El caso que las justifica.** El armado del turno necesita los precios del
catálogo: puede pedírselos (regla 1) o consultar la tabla `Servicio` por su
cuenta. Lo segundo es más rápido de escribir y rompe el día que el catálogo
cambie qué considera disponible — el armado sigue con la regla vieja hasta que
una clienta reserva algo que no se ofrece.

**Cada tabla tiene un módulo dueño.** Es la contracara de la regla 2:

| Tablas | Módulo dueño | Los demás |
|---|---|---|
| `Servicio`, `Extra`, `Retiro`, `ServicioExtra` | `CatalogoModule` | preguntan |
| `Salon` | `CatalogoModule` (lectura); el alta no está en el MVP | — |
| `Lugar`, `LugarServicio`, `Franja`, `Excepcion` | `GrillaModule` | preguntan |
| `Clienta`, `Reserva`, `ReservaExtra` | `ReservasModule` *(previsto)* | preguntan |

Se actualiza al agregar un módulo.

## Mapa de módulos

```mermaid
graph TD
    Pantallas["Pantallas de la clienta<br/>(previsto)"] -->|HTTP| API
    Panel["Panel del salón<br/>(previsto)"] -->|HTTP| API

    subgraph API["API — NestJS"]
        Health["HealthModule<br/>¿está todo vivo?"]
        Catalogo["CatalogoModule<br/>qué se puede elegir"]
        Salon["SalonModule<br/>de qué salón es el pedido"]
        Turnos["TurnosModule<br/>cuánto sale y cuánto dura"]
        Grilla["GrillaModule<br/>qué está abierto ese día"]
        Disp["DisponibilidadModule<br/>(previsto)"]
        Reservas["ReservasModule<br/>(previsto)"]
        Prisma["PrismaModule<br/>la conexión"]
    end

    Health --> Prisma
    Catalogo --> Prisma
    Catalogo --> Salon
    Turnos --> Catalogo
    Disp --> Turnos
    Disp --> Grilla
    Grilla --> Prisma
    Grilla --> Salon
    Reservas --> Disp
    Reservas --> Prisma
    Prisma --> DB[("PostgreSQL")]
```

Las flechas son dependencias reales: **quien apunta, importa al otro**. Que
`ReservasModule` dependa de `DisponibilidadModule` y no al revés no es un
detalle — significa que reservar *pregunta* si el horario entra, en vez de
decidirlo por su cuenta.

## Los módulos que existen hoy

### `PrismaModule` — la conexión a la base

- **Qué ofrece**: `PrismaService`, que abre la conexión cuando la API levanta y
  la cierra cuando se apaga.
- **De qué depende**: de `DATABASE_URL`. Si falta, la aplicación **no arranca**
  y dice qué hacer.
- **Qué no hace**: no tiene ninguna regla de negocio. Es solo el acceso.
- **No es global a propósito**: cada módulo que toca la base lo importa, y así
  queda escrito quién depende de ella.

### `HealthModule` — ¿está todo vivo?

- **Qué responde**: `GET /health` → `{"api":"ok","base":"ok"}`.
- **De qué depende**: de `PrismaModule`.
- **Cómo trabaja**: hace un `SELECT 1` real contra Postgres antes de contestar.
  Un `ok` fijo diría que todo está bien con la base caída.
- **Para qué sirve de verdad**: es lo que el servicio de despliegue consulta
  para saber si la API está sana.

### `SalonModule` — de qué salón es el pedido

- **Qué ofrece**: `SalonActualService`, con un solo método: `id()`.
- **De qué depende**: de `SALON_ID`, una variable de entorno. Si falta o no es un
  entero positivo, **la aplicación no arranca**.
- **Por qué existe**: es el **único lugar** que contesta esa pregunta. Hoy la
  respuesta es constante —la API sirve a un salón y cuál lo fija el despliegue—;
  el día que haya varios, el id va a salir del pedido y el cambio entra acá
  adentro. Los módulos que lo consultan no se enteran.
- **Qué no hace**: no consulta la base ni sabe qué es HTTP.

Ver [`adr/003-el-salon-sale-del-entorno.md`](adr/003-el-salon-sale-del-entorno.md).

### `CatalogoModule` — qué se puede elegir

- **Qué responde**: `GET /catalogo` → los servicios activos, cada uno con los
  extras compatibles que estén activos, y los retiros activos.
- **De qué depende**: de `PrismaModule` y de `SalonModule`.
- **Cómo trabaja**: filtra por el salón actual y por `activo`, ordena
  alfabéticamente en la base, y **aplana la tabla de vínculo**: `ServicioExtra`
  no se ve desde afuera.
- **Es una sola llamada y no tres** porque la pantalla de armado necesita el
  catálogo entero, y son decenas de filas que cambian poco.
- **Lo que sale por HTTP está declarado** en `catalogo.types.ts`, no heredado del
  tipo que genera Prisma: publicar un campo tiene que ser una decisión, no el
  efecto secundario de tocar una tabla.

### `TurnosModule` — cuánto sale y cuánto dura

- **Qué responde**: `POST /turnos/armado` → lo elegido con su nombre y su precio,
  más el precio total y la duración total del turno.
- **De qué depende**: solo de `CatalogoModule`. **No importa `PrismaModule`**:
  no es dueño de ninguna tabla.
- **Por qué no guarda nada**: armar un turno es una consulta, no un hecho del
  negocio. La composición se persiste recién al reservar, con los precios
  congelados de ese momento, y esa tabla va a ser de `ReservasModule`.
- **Cómo valida**: le pide el catálogo a `CatalogoService`, que ya devuelve solo
  lo activo de este salón y, por servicio, solo los extras compatibles. Un extra
  que no está en esa lista se rechaza sin averiguar por qué falta: si no existe,
  si está dado de baja o si no va con ese servicio, para la clienta es lo mismo.
- **Qué rechaza con `400`**: el servicio no disponible, un extra que no se le
  puede sumar, el mismo extra dos veces, y el retiro no disponible.
- **Contesta `200` y no `201`** aunque sea un `POST`: no se creó ningún recurso.
  Es `POST` porque la lista de extras es de largo variable y en la query string
  habría que parsearla a mano.

Ver [`adr/005-el-turno-armado-se-calcula.md`](adr/005-el-turno-armado-se-calcula.md).

### `GrillaModule` — qué está abierto ese día

- **Qué responde**: `GET /grilla?fecha=2026-10-12` → cada lugar activo del salón
  con los tramos que tiene abiertos ese día, en minutos desde la medianoche. Con
  `&servicioId=` devuelve solo los lugares que hacen ese servicio.
- **De qué depende**: de `PrismaModule` y de `SalonModule`.
- **Cómo trabaja**: toma la plantilla del día de la semana, le suma lo que la
  dueña abrió y le resta lo que cerró. Esa cuenta es una función pura,
  `abiertoElDia`, con sus propios tests. Los tramos que se tocan se juntan —9 a
  13 más 13 a 14 da 9 a 14—, y si una apertura y un cierre se pisan, **gana el
  cierre**: un horario de menos lo corrige la dueña; uno de más es una clienta que
  llega y no la atiende nadie.
- **Qué no hace**: no sabe de reservas. Dice qué está **abierto**, no qué está
  **libre**: eso es la disponibilidad, que le resta los turnos tomados. Si la
  grilla lo supiera, "está ocupado" se calcularía en dos módulos.
- **Es el único que lee `LugarServicio`**: la disponibilidad le pregunta qué
  lugares hacen un servicio, no consulta la tabla (regla 2).
- **La fecha se toma a medianoche UTC**, así el día de la semana no depende del
  huso horario del servidor.

Ver [`adr/006-la-grilla-son-lugares-abiertos-por-franjas.md`](adr/006-la-grilla-son-lugares-abiertos-por-franjas.md).

## Los módulos previstos

Salen del alcance del MVP (`propuesta.md`, punto 2.3). Cada uno responde **una**
pregunta:

| Módulo | La pregunta que responde |
|---|---|
| `DisponibilidadModule` | ¿En qué horarios entra completo **este** turno armado? |
| `ReservasModule` | Tomar el horario. Que no se lo lleven dos ya lo garantiza la base (ADR-007); el módulo traduce el rechazo en "ese horario se acaba de ocupar" |

## Las tablas que existen hoy — el catálogo

Migración `20260825133434_catalogo`. Cinco tablas:

| Tabla | Qué guarda |
|---|---|
| `Salon` | El salón. En el MVP tiene una fila |
| `Servicio` | Los servicios base, con precio y duración |
| `Extra` | Los extras, con precio y duración. Cada uno una sola vez |
| `Retiro` | Los retiros, con precio y duración |
| `ServicioExtra` | Qué extra se puede sumar a qué servicio: una fila por combinación permitida |

**Son tres tablas y no una con un campo `tipo` porque la base impide guardar un
turno mal armado**: `servicioBaseId` apunta a `Servicio` y no puede apuntar a un
retiro. El porqué completo y las alternativas están en el
[ADR-002](adr/002-catalogo-en-tres-tablas.md).

Qué garantiza cada restricción, y por qué está:

| Restricción | Qué impide |
|---|---|
| `@@unique([salonId, nombre])` | Dos servicios con el mismo nombre **en el mismo salón**. El límite es del salón, no del sistema |
| `@@id([servicioId, extraId])` | Cargar dos veces la misma combinación permitida |
| `ON DELETE RESTRICT` | Borrar un salón que tenga catálogo colgando |
| `activo Boolean` | Que sacar algo del catálogo rompa los turnos que ya lo usaron |

**Convenciones del esquema:** el precio es `Int` en **pesos enteros** —el salón
no cobra centavos— y la duración es `Int` en **minutos**. El `salonId` está desde
la primera tabla porque el punto 2.3 de la propuesta declara que el diseño
contempla otros salones aunque el módulo no se construya.

**Límite conocido:** nada impide vincular un servicio de un salón con un extra de
otro — la base verifica que ambos existan, no que sean del mismo salón. En el MVP
hay un solo salón, así que el estado inválido no se puede construir. Se resuelve
con claves foráneas compuestas (ADR-002).

## Las tablas de la grilla

Migración `20260924162428_grilla`. Cuatro tablas y un enum:

| Tabla | Qué guarda |
|---|---|
| `Lugar` | Dónde se atiende: una mesa de uñas, una camilla. Es lo que limita cuántos turnos entran a la vez |
| `LugarServicio` | Qué servicio se puede hacer en qué lugar: una fila por combinación permitida |
| `Franja` | La plantilla semanal: un lugar, un día de la semana, desde y hasta |
| `Excepcion` | Lo que cambia un día puntual: un lugar, una fecha, desde, hasta, y si `ABRE` o `CIERRA` |

**El recurso es el lugar, no la persona**, y **la plantilla va en franjas, no en
horarios fijos**. El porqué y las alternativas están en el
[ADR-006](adr/006-la-grilla-son-lugares-abiertos-por-franjas.md).

| Restricción | Qué impide |
|---|---|
| `@@unique([salonId, nombre])` en `Lugar` | Dos "Mesa 1" en el mismo salón |
| `@@id([lugarId, servicioId])` | Cargar dos veces el mismo vínculo |
| `activo Boolean` en `Lugar` | Que dar de baja una mesa borre la historia de los turnos que se hicieron ahí |
| `CHECK` del día entre 0 y 6 | Una franja un "día 9" |
| `CHECK` de `0 ≤ desde < hasta ≤ 1440` | Una franja o una excepción "de 13 a 9", o que termine pasada la medianoche |

**Los `CHECK` no están en `schema.prisma`**: Prisma no los sabe escribir, así que
van a mano en la migración. El esquema lo avisa con un comentario.

**Convenciones:** las horas son `Int` en **minutos desde la medianoche** (9:30 es
570) y el día de la semana va de 0 (domingo) a 6 (sábado), como lo cuentan
Postgres y JavaScript. La fecha de la excepción es `DATE`: un día suelto, sin
hora ni zona horaria.

## Las tablas de la reserva

Migración `20260925140051_reservas`. Las tablas existen; el módulo que las usa,
`ReservasModule`, es de la entrega 3.

| Tabla | Qué guarda |
|---|---|
| `Clienta` | Quien reserva: teléfono y nombre. Se identifica por teléfono, sin registro. **No es una ficha ni un historial** |
| `Reserva` | Un turno tomado: la clienta, la mesa, el día, de qué hora a qué hora, el servicio y el retiro con su precio copiado |
| `ReservaExtra` | Los extras de una reserva, cada uno con su precio copiado |

**"Un horario, un turno" es una restricción de no superposición**, no de
unicidad: dos turnos de largo distinto pueden empezar a horas diferentes y
pisarse igual. El porqué y las alternativas están en el
[ADR-007](adr/007-un-horario-un-turno-sin-superposicion.md).

| Restricción | Qué impide |
|---|---|
| `EXCLUDE` sobre mesa, fecha y `[inicio, fin)` | Dos reservas encimadas en la misma mesa el mismo día, aunque lleguen en el mismo segundo |
| `@@unique([salonId, telefono])` | La misma clienta cargada dos veces |
| `CHECK` de `0 ≤ inicio < fin ≤ 1440` | Un turno "de 13 a 9" |
| `CHECK` del retiro con su precio | Un retiro sin precio, o un precio sin retiro |
| `ON DELETE RESTRICT`, también en el retiro | Borrar del catálogo algo que una reserva usó |

**El precio de cada ítem se copia al reservar**: el comprobante de octubre dice
lo que se cobró en octubre aunque el catálogo haya cambiado. **La duración no se
guarda**: es fin menos inicio. El `EXCLUDE` y los `CHECK` van a mano en la
migración y no se ven en `schema.prisma`.

## Cómo se organizan las carpetas de la API

**Una carpeta por módulo, con todo lo suyo adentro** — `src/catalogo/` tiene su
`.module.ts`, su `.controller.ts`, su `.service.ts` y sus tipos. No hay carpetas
por capa (`controllers/`, `services/`): para entender una pieza se toca **una**
carpeta, no tres.

Cierra lo que el ADR-001 dejó abierto.

## Reglas que valen para todo el sistema

1. **Una regla de negocio vive en un solo lugar.** Cuánto dura un turno armado o
   si un horario está libre se contesta en un único módulo. Los demás preguntan.
2. **El controller no calcula.** Traduce HTTP y llama al servicio.
3. **Las pantallas preguntan, no recalculan.** Si el frontend suma duraciones por
   su cuenta, el día que cambie la regla va a quedar desactualizado.
4. **El invariante lo garantiza la base de datos.** "Un horario, un turno" se
   defiende con una restricción de la base —de no superposición, ver ADR-007—,
   no con una verificación previa: entre que se consulta y se escribe, la otra
   reserva ya pasó.
5. **La grilla es dato, no código.** Los horarios se editan, no se despliegan.
6. **La forma de lo que entra la comprueba el framework, no el servicio.** Un
   `ValidationPipe` global rechaza con `400` lo que no coincide con el DTO antes
   de llegar al servicio, y descarta los campos que el DTO no declara. El
   servicio recibe datos con la forma correcta y solo se ocupa de las reglas del
   salón.
7. **La API se documenta sola.** Las rutas y lo que devuelve cada una se generan
   desde el código en cada compilación y se publican en `/docs`. Por eso lo que
   sale por HTTP se declara con clases y no con `type`: un `type` se borra al
   compilar y no deja nada que documentar.
8. **Lo que depende de la base se prueba contra la base.** Un test unitario
   reemplaza a Prisma por un doble que devuelve lo que se le indica: sirve para
   comprobar qué hace el servicio con esa respuesta, y **no** puede comprobar que
   la consulta esté bien escrita, porque el doble no mira el `select` ni el
   `where`. Los filtros, el orden y el aislamiento por salón se prueban de punta
   a punta, contra una base con datos.

## El recorrido de una reserva *(previsto)*

El camino completo, para tenerlo a la vista mientras se construye:

1. La clienta arma su turno → `CatalogoModule` da los servicios;
   `TurnosModule` calcula precio y duración.
2. Pide ver los horarios → `DisponibilidadModule` cruza la duración del turno
   con la grilla del día y con los turnos ya tomados.
3. Elige uno y confirma → `ReservasModule` lo guarda; la base rechaza el
   segundo intento sobre el mismo horario.
4. Ve el comprobante → sale de lo que quedó guardado, no de lo que la pantalla
   creía.
