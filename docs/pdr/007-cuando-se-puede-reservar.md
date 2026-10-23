# PDR-007: Se reserva cada media hora, sin anticipación mínima y hasta 45 días

- **Estado**: Aceptado
- **Fecha**: 2026-10-01
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

La disponibilidad sabe qué está abierto (la grilla) y qué está ocupado (la
agenda). Para ofrecerle horarios a la clienta faltan tres reglas del salón: **a
qué horas puede empezar un turno**, **con cuánta anticipación** se puede
reservar, y **hasta qué fecha**.

No son técnicas: cambian lo que ve la clienta y cómo se llena la agenda.

## Decisión

- **Los turnos empiezan cada 30 minutos, alineados al reloj**: 9:00, 9:30,
  10:00. Se ofrece cada inicio donde el turno armado entra completo.
- **Sin anticipación mínima**: si la mesa está abierta ahora, se puede reservar
  para ahora.
- **Hasta 45 días adelante.**
- **"Ahora" es la hora de Argentina**, aunque el servidor corra en otra zona.

El paso y los 45 días viven en un solo lugar del backend.

## Consecuencias

**A favor**

- Horarios redondos, que la clienta lee de un vistazo y que se parecen a los que
  el salón publica hoy.
- Con 45 días, la clienta que sale del turno de este mes puede sacar el del mes
  siguiente en el momento.
- Sin anticipación, un hueco que queda libre a último momento todavía se puede
  llenar.

**En contra — asumido a conciencia**

- **Un turno puede caer sin aviso.** Sin anticipación mínima y sin avisos
  automáticos (fuera del MVP), la dueña se entera mirando el panel. Se apoya en
  el supuesto del [PDR-005](005-el-recurso-es-el-lugar.md): si la mesa está
  abierta, hay quien atiende.
- **El hueco que deja el paso de 30 no es un descanso.** Un turno de 45 minutos
  que empieza a las 9 termina a las 9:45, y el siguiente puede empezar recién a
  las 10; pero si el turno dura una hora, el siguiente arranca pegado. El
  descanso garantizado sería un margen entre turnos, que quedó afuera
  ([ADR-006](../adr/006-la-grilla-son-lugares-abiertos-por-franjas.md)).

## Las alternativas consideradas

**Otro paso.** Cada 15 minutos aprovecha cualquier hueco, pero alarga la lista
que la clienta recorre en el celular; cada hora deja más tiempo sin usar.

**Contar desde el inicio de cada hueco**, en vez de alinear al reloj. Aprovecha
más la agenda, pero le mezcla a la clienta 9:15, 9:30 y 9:45 de mesas distintas.
Alineado, una franja que abre 9:15 ofrece desde 9:30.

**Dos horas de anticipación mínima**, para que la dueña tenga tiempo de verlo, o
**reservar hasta el día anterior**. La segunda mata la reserva de madrugada para
esa misma mañana. Las dos se descartaron por el supuesto de arriba: si la mesa
está abierta, hay quien atiende.

**30 días de ventana.** Muchas clientas salen de un turno y reservan el del mes
siguiente; 45 cubre eso con margen.
