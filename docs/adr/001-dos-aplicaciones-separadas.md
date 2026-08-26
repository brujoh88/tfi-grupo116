# ADR-001: La API y las pantallas son dos aplicaciones separadas

- **Estado**: Aceptado
- **Fecha**: 2026-08-19
- **Deciden**: Gustavo Tiseira y Nicolás Viruel

## Contexto

El proyecto tiene que resolver dos cosas bien distintas: por un lado calcular qué
horarios quedan libres y garantizar que un horario no se le dé a dos clientas; por
otro, mostrarle eso a alguien que entra desde un link de Instagram, de madrugada y
desde el celular.

Las restricciones con las que se decide:

- **Somos dos y estamos aprendiendo mientras construimos.** Profundizar en NestJS
  es un objetivo declarado del proyecto, no un medio.
- **El tiempo es fijo y ajustado**: unas 125 horas hasta la entrega final.
- **Hay concurrencia real**: dos clientas pueden apretar "reservar" para el mismo
  horario en el mismo segundo.
- **Todo pasa por el celular**, y la clienta no instala nada.

## Decisión

Dos aplicaciones en un mismo repositorio:

| Pieza | Elección |
|---|---|
| API | **NestJS** con TypeScript |
| Base de datos | **PostgreSQL** con Prisma |
| Pantallas | **React** con Vite |
| Entorno de desarrollo | Docker Compose |

Y tres decisiones de diseño que quedan cerradas acá:

1. **El invariante lo garantiza la base de datos, no el código.** Una restricción
   de unicidad sobre (recurso, fecha, hora). Un chequeo previo en la aplicación no
   alcanza cuando dos reservas entran a la vez: entre que se consulta y se
   escribe, la otra ya pasó.
2. **Una regla de negocio vive en un solo lugar.** Cuánto dura un turno armado,
   qué extras admite un servicio o si un horario está libre se responde en un
   único lugar del backend. Las pantallas preguntan; no recalculan.
3. **La grilla es dato, no código.** Los horarios que ofrece el salón se editan,
   no se despliegan.

## Consecuencias

**A favor**

- Las reglas del negocio quedan separadas de la pantalla, y eso es lo que se
  defiende ante el comité: se puede mostrar la API contestando sola.
- La estructura de módulos de Nest ordena el trabajo cuando somos dos sobre el
  mismo código.
- Postgres defiende el invariante aunque el código tenga un error.

**En contra — asumido a conciencia**

- **Es más trabajo que una sola aplicación**: dos despliegues, dos juegos de
  variables de entorno, CORS entre las dos partes y el acceso al panel cruzando el
  límite. Sobre 125 horas se nota.
- **Ninguno de los dos maneja React todavía.** La curva está contada en el plan y
  declarada como riesgo.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|---|---|
| **Next.js full-stack, una sola aplicación** | Menos infraestructura y un solo despliegue. Se descartó porque deja a Nest afuera —que es el objetivo de aprendizaje— y porque no impone ninguna estructura: sin disciplina, la misma regla de negocio termina escrita en tres pantallas |
| **Nest + Next** | Con el backend en Nest, el lado servidor de Next no se iba a usar: era pagar la parte más compleja del framework sin aprovecharla, y una segunda curva de aprendizaje en paralelo |
| **Base de datos documental** | El modelo es relacional —un turno referencia servicio, extras, recurso y clienta— y el invariante de "un horario, un turno" se defiende mucho mejor con una restricción de base |
| **Aplicación móvil nativa** | La clienta llega de un link de Instagram a las tres de la mañana. No va a instalar nada |

## Qué queda abierto

- ~~Cómo se estructuran las carpetas dentro de la API.~~ **Resuelto el 26/08 en
  el [ADR-004](004-monolito-modular-por-dominio.md):** una carpeta por módulo.
- Cómo viaja la clave del panel entre las dos aplicaciones.
