# ADR-008: La agenda es dueña de las reservas, abajo de la disponibilidad

- **Estado**: Aceptado
- **Fecha**: 2026-10-01
- **Deciden**: Gustavo Tiseira y Nicolás Viruel
- **Modifica**: el ADR-005, que asignaba la tabla de reservas a `ReservasModule`

## Contexto

La disponibilidad necesita dos datos: qué está **abierto**, que se lo pide a la
grilla, y qué está **ocupado**, que está en la tabla `Reserva`. El mapa de
`docs/arquitectura.md` preveía esa tabla como de `ReservasModule`, y a
`ReservasModule` preguntándole a la disponibilidad si un horario entra antes de
guardarlo.

Con eso, las dos reglas de dependencia chocan. La regla 2 dice que ningún módulo
lee tablas ajenas, así que la disponibilidad tendría que preguntarle a reservas
qué está ocupado. Pero reservas ya le pregunta a la disponibilidad: quedarían
apuntándose entre sí, y la regla 3 prohíbe los círculos. Nest, de hecho, no
arranca.

## Decisión

**Las reservas se parten en dos módulos.**

- **`AgendaModule`**, abajo: dueño de `Clienta`, `Reserva` y `ReservaExtra`. Sabe
  guardar y decir qué está ocupado. No depende de ningún módulo de negocio y no
  tiene endpoint propio.
- **`ReservasModule`**, arriba: el trámite de reservar. Arma el turno, le
  pregunta a la disponibilidad si entra y en qué mesa, y lo guarda en la agenda.

La disponibilidad le pregunta a la agenda qué está ocupado. Las flechas quedan
todas hacia abajo: reservas → disponibilidad → agenda, y reservas → agenda.

## Consecuencias

**A favor**

- "Qué está ocupado" se contesta en un solo lugar, y lo usan los dos módulos que
  lo necesitan sin depender uno del otro.
- La disponibilidad no importa `PrismaModule`: cruza lo que le contestan el
  armado, la grilla y la agenda, y su cuenta es una función pura que se prueba
  sin base.

**En contra — asumido a conciencia**

- Un módulo más en el mapa, y uno que por ahora solo tiene un método de lectura.
- Lo que el ADR-005 decía sobre dónde se guarda la composición del turno sigue
  valiendo, pero la tabla pasa a ser de la agenda, no de `ReservasModule`.

## Las alternativas consideradas

**Que la disponibilidad lea `Reserva` directo.** Lo más rápido de escribir.
Rompe la regla 2: "qué está ocupado" pasaría a escribirse en dos módulos, y el
día que cambie —por ejemplo, cuando haya reservas canceladas que no ocupan— se
cambia en uno solo.

**Que reservas no le pregunte a la disponibilidad**, y confíe en que la base
rechaza las superposiciones (ADR-007). La base frena dos turnos encimados, pero
no un turno a las 3 de la mañana ni uno en una mesa que no hace ese servicio. Eso
lo sabe solo la disponibilidad.
