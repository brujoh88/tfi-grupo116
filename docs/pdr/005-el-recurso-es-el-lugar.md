# PDR-005: Lo que limita los turnos es el lugar, no la persona

- **Estado**: Aceptado
- **Fecha**: 2026-09-24
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El punto 2.3 de la propuesta define la grilla como "qué recurso atiende qué, qué
días y a qué horas". Al diseñarla hubo que contestar qué es un *recurso* en este
salón: la mesa de uñas, la camilla, o la profesional que atiende.

La respuesta cambia qué carga la dueña y cuántas agendas tiene que mirar el
sistema para contestar si un horario está libre.

## Decisión

**El recurso es el lugar físico.** Lo que decide si dos turnos entran a la vez
es si hay un lugar libre para cada uno. La grilla dice qué lugar hace qué
servicios, qué días y a qué horas. **Las profesionales no se modelan en el MVP.**

## Consecuencias

**A favor**

- El salón tiene pocas profesionales, y en la práctica lo que se agota primero
  son las mesas. Se contesta cada horario con una sola agenda, la del lugar.
- La dueña carga lo que ya conoce: "la mesa de uñas abre de 9 a 13".

**En contra — asumido a conciencia**

- **El horario del lugar lleva implícito el de quien lo atiende.** Si la mesa
  figura abierta de 9 a 18, es porque hay alguien para atenderla. Si esa persona
  falta, la dueña cierra el horario a mano desde el panel
  ([PDR-003](003-el-panel-abre-y-cierra-horarios-con-una-clave.md)). El sistema
  no sabe *por qué* se cerró.
- La clienta no puede elegir con quién se atiende.

## Las alternativas consideradas

**El recurso es la persona**: cada profesional con su agenda y sus servicios. Se descartó porque obliga a cruzar dos agendas —la de la profesional y la del
lugar— para contestar cada horario, y eso es trabajo que el salón de hoy no
necesita.

## Cómo crece

Cuando el salón sume personal, se agrega la agenda de cada profesional asignada
a un lugar. La grilla de lugares no se tira: pasa a ser una de las dos
condiciones para que un turno entre.

## Relacionadas

Cómo se guarda la grilla:
[ADR-006](../adr/006-la-grilla-son-lugares-abiertos-por-franjas.md).
