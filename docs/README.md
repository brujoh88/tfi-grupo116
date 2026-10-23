# Documentación

Todo lo que explica el proyecto, ordenado por tema. Para instalarlo y correrlo,
ver el [README del repositorio](../README.md).

## El proyecto

| Documento | Qué tiene |
|---|---|
| [Propuesta](propuesta.md) | El problema, la solución, el alcance del MVP, el stack con su justificación y el plan de trabajo |
| [Listado de módulos](modulos.md) | Los módulos funcionales, con su descripción, prioridad y etapa |

## Cómo está construido

| Documento | Qué tiene |
|---|---|
| [Arquitectura](arquitectura.md) | El estilo, las reglas de dependencia, quién es dueño de cada tabla, cada módulo de la API y **el recorrido de una reserva** en un diagrama de secuencia |
| [Modelo de datos](modelo-de-datos.md) | El diagrama de la base —doce tablas en catálogo, grilla y reservas—, con sus índices y restricciones |
| [`database/`](../database/) | El DDL completo, generado de las migraciones |
| [API en vivo](https://tfi-grupo116-production.up.railway.app/docs) | Cada endpoint documentado con Swagger y ejecutable desde el navegador, con datos de ejemplo |

## Las decisiones, con su porqué

Se separan por tipo. Un **ADR** decide cómo se construye: dónde vive una regla,
quién es dueño de una tabla, cómo se garantiza algo. Un **PDR** decide qué hace
el producto: qué entra, qué ve la clienta, qué reglas del salón sigue. Cada uno
dice el contexto, la decisión, lo que se asume en contra y las alternativas
descartadas.

### De arquitectura (ADR)

| ADR | Decide |
|---|---|
| [001](adr/001-dos-aplicaciones-separadas.md) | La API y las pantallas son dos aplicaciones separadas |
| [002](adr/002-catalogo-en-tres-tablas.md) | Servicios, extras y retiros van en tres tablas, no en una |
| [003](adr/003-el-salon-sale-del-entorno.md) | De qué salón es un pedido lo contesta un solo lugar, y hoy sale del entorno |
| [004](adr/004-monolito-modular-por-dominio.md) | La API es un monolito modular por dominio |
| [005](adr/005-el-turno-armado-se-calcula.md) | El turno armado se calcula, no se guarda |
| [006](adr/006-la-grilla-son-lugares-abiertos-por-franjas.md) | La grilla son lugares abiertos por franjas, no horarios fijos |
| [007](adr/007-un-horario-un-turno-sin-superposicion.md) | "Un horario, un turno" lo garantiza la base con una restricción de no superposición |
| [008](adr/008-la-agenda-es-duena-de-las-reservas.md) | Las reservas se parten en agenda (dueña de las tablas) y reserva (el trámite), para que la disponibilidad no quede en un círculo |

### De producto (PDR)

| PDR | Decide |
|---|---|
| [001](pdr/001-la-sena-queda-fuera-del-mvp.md) | La seña por Mercado Pago queda fuera del MVP |
| [002](pdr/002-el-turno-se-arma.md) | El turno se arma —servicio, extras y retiro—, no se elige de una lista |
| [003](pdr/003-el-panel-abre-y-cierra-horarios-con-una-clave.md) | El panel abre y cierra horarios a mano, y se entra con una sola clave |
| [004](pdr/004-el-turno-guarda-copia-del-precio.md) | El turno guarda copia del precio; el catálogo no se versiona |
| [005](pdr/005-el-recurso-es-el-lugar.md) | Lo que limita los turnos es el lugar, no la persona |
| [006](pdr/006-la-clienta-se-identifica-por-telefono.md) | La clienta se identifica por teléfono, sin registro y sin historial |
| [007](pdr/007-cuando-se-puede-reservar.md) | Se reserva cada media hora, sin anticipación mínima y hasta 45 días |

## Por entrega

Lo que pide cada etapa de la cátedra y dónde está:

| Entrega | Dónde |
|---|---|
| **1 — Propuesta y repositorio** | [Propuesta](propuesta.md) y este repositorio |
| **2 — Esquema de la base y módulos** | [Modelo de datos](modelo-de-datos.md), [`database/`](../database/), [Listado de módulos](modulos.md), [Arquitectura](arquitectura.md) y las decisiones de arriba |
| **3 — Repositorio completo, despliegue, informe y video** | En curso |
