# ADR-004: Monolito modular por dominio, con capas dentro de cada módulo

- **Estado**: Aceptado
- **Fecha**: 2026-08-26
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El proyecto tenía decisiones de arquitectura tomadas y escritas —ADR-001,
ADR-003, las carpetas por módulo, las reglas de `arquitectura.md`— pero **el
estilo no estaba nombrado**, y las reglas de dependencia existían solo como
flechas en un diagrama.

Hace falta cerrarlo ahora porque el armado del turno es **el primer módulo que va
a depender de otro módulo de negocio** (`TurnosModule → CatalogoModule`), no solo
de la infraestructura. Es donde las reglas dejan de ser evidentes.

## Decisión

**Monolito modular por dominio, con capas dentro de cada módulo.**

- **Monolito**: una aplicación de backend, un despliegue, una base. (Las dos
  aplicaciones del ADR-001 son backend y frontend; el backend es uno.)
- **Modular por dominio**: se parte por área del negocio —catálogo, turnos,
  grilla—, no por tipo de archivo.
- **En capas dentro del módulo**: el controller traduce HTTP y no calcula, el
  service tiene las reglas, Prisma accede a los datos.
- **Sin capa de repositorio**: el service consulta Prisma directamente.

### Reglas de dependencia

| # | Regla | Qué evita |
|---|---|---|
| 1 | Un módulo de negocio **puede** usar el service de otro, si lo exporta | Que cada uno reimplemente lo que otro ya sabe contestar |
| 2 | **Ninguno consulta tablas que no son suyas.** Cada tabla tiene un módulo dueño | La misma regla de negocio escrita en dos lugares |
| 3 | **No hay dependencias circulares** | Módulos que no se pueden entender ni probar por separado |
| 4 | **La infraestructura no depende del negocio** | Que `PrismaModule` o `SalonModule` sepan que existe el catálogo |

La regla 2 es la que sostiene en la práctica la regla *una regla de negocio vive
en un solo lugar*: sin ella, cualquier módulo puede reimplementar la lógica de
otro consultando su tabla, y nadie se entera hasta que las dos versiones
discrepan.

## Consecuencias

**A favor.** El recorrido de un pedido se lee de corrido, de la URL a la
consulta, sin capas de indirección. La superficie que hay que poder defender es
chica y toda visible. Y hay una respuesta única a "¿qué arquitectura usaron?".

**En contra, asumido.** El día que Prisma se cambiara por otra cosa hay que tocar
todos los services — se acepta porque PostgreSQL es una decisión defendida en la
propuesta, no una pieza intercambiable. Probar un service sin base es más difícil,
porque habla con Prisma directo.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|---|---|
| **Hexagonal / clean** | Su beneficio es que el negocio no conozca la base. No ayuda con lo que este sistema va a cambiar de verdad, que son reglas de negocio: si el retiro pasa a sumar diez minutos, se toca el service de turnos con hexagonal y sin ella |
| **Capas globales** (`controllers/`, `services/`) | Parte por tipo de archivo: entender el catálogo obliga a abrir tres carpetas, y nada impide que un service consulte cualquier tabla |
| **Microservicios** | No hay problema de escala que resolver, y multiplica despliegues y coordinación sobre un plan de 125 horas |
| **Serverless** | Encaja mal con Nest, que necesita un proceso vivo, y con conexiones persistentes a una base relacional |

## Qué queda abierto

- **Migrar a hexagonal es posible y es incremental**: se hace por módulo. La
  razón que lo justificaría —probar la disponibilidad sin levantar Postgres— no
  apareció todavía.
- **Dónde vive la lógica que cruza módulos**: `DisponibilidadModule` va a
  necesitar turnos y grilla a la vez. Se resuelve al construirlo.
