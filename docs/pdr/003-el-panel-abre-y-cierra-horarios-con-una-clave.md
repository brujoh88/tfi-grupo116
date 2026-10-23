# PDR-003: El panel abre y cierra horarios a mano, con una sola clave

- **Estado**: Aceptado
- **Fecha**: 2026-08-18
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El salón ya usó un sistema de turnos comercial y lo dejó por dos motivos: la
mensualidad, y que **no le dejaba mover los horarios de uñas**, que es como llena
los huecos de la agenda. Un domingo a la noche la dueña ve la mañana del lunes
vacía y publica turnos de uñas que atiende ella.

La pregunta era cuánto panel entra en el MVP, y quién entra a él.

## Decisión

**Un panel de una sola pantalla**: el día del salón, y abrir o cerrar horarios
puntuales. Los horarios de un día son la plantilla, más lo que la dueña abrió,
menos lo que cerró.

**Se entra con una sola clave del salón**, guardada como variable de entorno del
servidor. Sin tabla de usuarios, sin registro, sin roles.

## Consecuencias

**A favor**

- Cubre exactamente lo que el sistema anterior no dejaba hacer. Si este tampoco
  dejara, el argumento del proyecto se daría vuelta.
- Usuarios y roles eran unas cinco horas del plan que se van al producto.

**En contra — asumido a conciencia**

- El panel no mueve turnos, no registra asistencia ni factura: eso sigue
  haciéndose como hoy (punto 2.3 de la propuesta).
- **Una sola clave no distingue quién hizo qué.** Sirve mientras administre una
  sola persona; las profesionales no entran al panel.
- Cambiar la clave es cambiar una variable de entorno y redesplegar.

## Las alternativas consideradas

**El panel completo** —mover turnos, asistencia, facturación—. Es lo que tiene
cualquier sistema comercial y no es lo que el salón echaba de menos.

**Sin panel**, cargando las excepciones directo en la base. Es lo más barato,
pero deja a la dueña dependiendo de alguien técnico para lo único que el sistema
anterior no le daba.

**Usuarios con contraseña y roles.** Era lo estimado al principio. Resuelve un
problema que el salón todavía no tiene: el día que entren las profesionales, se
agrega.

## Relacionadas

Cómo se guardan las aperturas y los cierres:
[ADR-006](../adr/006-la-grilla-son-lugares-abiertos-por-franjas.md).
