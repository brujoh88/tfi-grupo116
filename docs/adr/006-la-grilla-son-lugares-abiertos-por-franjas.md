# ADR-006: La grilla son lugares abiertos por franjas

- **Estado**: Aceptado
- **Fecha**: 2026-09-24
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El punto 2.3 de la propuesta define la grilla como "qué recurso atiende qué, qué
días y a qué horas", y la quiere **editable, no escrita en el código**. La
bitácora del 18/08 agrega que los horarios de un día son la plantilla, más lo que
la dueña abrió, menos lo que cerró: es el diferenciador del proyecto frente a la
grilla fija de Fresha.

Al diseñar las tablas aparecen tres preguntas: qué es un "recurso", cómo se
escribe la plantilla, y cómo se guardan las excepciones.

## Decisión

**El recurso es el lugar físico** —una mesa de uñas, una camilla—, no la persona
que atiende. Lo que limita cuántos turnos entran a la vez es si hay un lugar
libre. Qué servicio se hace en qué lugar va en una tabla de vínculo, una fila por
combinación, como `ServicioExtra` en el catálogo: con dos mesas de uñas, el soft
gel se vincula a las dos.

**La plantilla se escribe en franjas**: cuándo está abierto cada lugar —"mesa 1,
lunes de 9 a 13 y de 15 a 19"—, no a qué horas empieza cada turno. A qué hora
puede arrancar un turno lo decide la disponibilidad, según cuánto dura lo que
armó la clienta.

**Las excepciones van en una sola tabla**, con un campo que dice si abren o
cierran. Si una apertura y un cierre se pisan, **gana el cierre**.

Cuatro tablas: `Lugar`, `LugarServicio`, `Franja` y `Excepcion`, todas de
`GrillaModule`.

## Consecuencias

**A favor**

- Un turno armado de cualquier largo entra donde entre completo: la grilla no le
  impone un tamaño.
- La dueña abre o cierra un tramo puntual sin tocar la plantilla, que es
  justamente lo que no le dejaba hacer Fresha.
- Saber qué lugares hacen un servicio y qué tienen abierto un día se contesta en
  un solo lugar. La disponibilidad pregunta; no lee estas tablas.

**En contra — asumido a conciencia**

- **El horario del lugar lleva implícito el de quien lo atiende.** Si la mesa
  figura abierta de 9 a 18 es porque hay alguien para atenderla. Si esa persona
  falta, la dueña cierra el horario con una excepción; el sistema no sabe por qué.
- Sumar un servicio nuevo obliga a vincularlo con cada lugar que lo hace.
- Los controles de que el día esté entre 0 y 6 y de que una franja empiece antes
  de terminar son `CHECK` escritos a mano en la migración: Prisma no los expresa y
  no se ven en `schema.prisma`, que lo avisa con un comentario.

## Las alternativas consideradas

**El recurso es la persona.** Cada profesional con su agenda y sus servicios. Se
descartó porque el salón tiene pocas profesionales y cruzar la agenda de la
persona con la del lugar es trabajo que hoy no resuelve nada. Cuando el salón
crezca, se suma la agenda del personal asignada a un lugar; la grilla de lugares
no se tira, pasa a ser una de las dos condiciones.

**Horarios fijos del largo del servicio más largo** —"lunes a las 9, 10:30,
12…"—. Es como piensa hoy la dueña, porque es lo que publica en la imagen, y es lo
más simple de cargar. Se descartó por dos motivos: un turno armado puede durar
más que el horario (soft gel con retiro y francesita dura 2 h 15), y estirar los
horarios al turno más largo hace perder capacidad —una mesa abierta de 9 a 18 da
4 turnos de 2 h 15, contra 12 esmaltados de 45 minutos—. Es, además, la grilla
fija que el proyecto le critica a Fresha.

**Dos tablas de excepciones**, aperturas y cierres. En el catálogo se separaron
las tablas porque algo apunta a ellas y la base impide que el turno apunte a la
equivocada (ADR-002). Acá nada apunta a una excepción: separarlas no protege de
nada y obliga a consultar dos tablas.

## Qué queda abierto

- **Un margen entre turnos** —minutos para limpiar la mesa—. Se evaluó como una
  columna por lugar y se dejó afuera: hoy los turnos van pegados. Si hace falta,
  entra con una migración y un ajuste en la disponibilidad.
- **Qué pasa con los turnos ya reservados cuando la dueña cierra ese horario.**
  El cierre no los cancela. Se decide al construir `ReservasModule`.
