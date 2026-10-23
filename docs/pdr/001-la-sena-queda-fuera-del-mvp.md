# PDR-001: La seña queda fuera del MVP

- **Estado**: Aceptado
- **Fecha**: 2026-08-18
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

En el salón, la seña por Mercado Pago es parte del trámite: la clienta reserva,
paga una parte y recién ahí el turno es suyo. La pregunta al definir el alcance
fue si el MVP llega hasta ese cobro o se queda en el turno reservado.

El problema que justifica el proyecto es otro: que el salón deje de pasarse el
día contestando mensajes para dar turnos (punto 1 de la propuesta). La seña
resuelve el ausentismo —la clienta que reserva y no viene—, que es un problema
real pero distinto.

## Decisión

**El MVP llega hasta el turno reservado y confirmado, sin cobro.** La seña queda
declarada como evolución del producto, en la tabla de lo que no entra del punto
2.3, y se integra solo si sobra tiempo al final.

Con ella sale también la **retención temporal del horario**: existe para
sostener un pago en curso. Sin cobro, la reserva se completa y se confirma en el
mismo momento.

## Consecuencias

**A favor**

- El proyecto no depende de nada que no controlemos. La cuenta de Mercado Pago
  es del salón, y es la única dependencia externa que podía bloquear una entrega.
- Sin pago de por medio, una reserva tiene dos estados menos (pendiente de pago,
  vencida) y no hace falta un webhook ni un proceso que libere horarios
  retenidos.

**En contra — asumido a conciencia**

- El ausentismo sigue igual que hoy: nada frena a quien reserva y no viene.
- **"Un horario, un turno" tiene que defenderse sin el pago.** Con seña, la
  retención ordenaba quién se quedaba el horario; sin ella, lo arbitra la base
  sola ([ADR-007](../adr/007-un-horario-un-turno-sin-superposicion.md)).

## Las alternativas consideradas

**Seña dentro del MVP, con Checkout Pro y el webhook de confirmación.** Es como
trabaja hoy el salón. Se descartó porque suma un tercero del que dependen las
pruebas y el despliegue, y el tiempo que lleva no ataca el problema de los
mensajes.

## Cómo crece

Si entra, la reserva suma un estado "pendiente de pago" con vencimiento, y la
restricción de no superposición tiene que mirar solo las reservas vigentes, igual
que con las cancelaciones.
