# Diagrama entidad-relación

El esquema completo de la base de datos: doce tablas en tres grupos —catálogo,
grilla y reservas—. La fuente es
[`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) y el SQL que lo
crea está en [`database/`](../database/). Qué guarda cada tabla y por qué está
armada así se explica en [`arquitectura.md`](arquitectura.md).

Los tipos son los de PostgreSQL. `PK` es clave primaria, `FK` clave foránea y
`UK` parte de una clave única.

```mermaid
erDiagram
    Salon ||--o{ Servicio : ofrece
    Salon ||--o{ Extra : ofrece
    Salon ||--o{ Retiro : ofrece
    Salon ||--o{ Lugar : tiene
    Salon ||--o{ Clienta : atiende

    Servicio ||--o{ ServicioExtra : admite
    Extra ||--o{ ServicioExtra : "se suma a"

    Lugar ||--o{ LugarServicio : hace
    Servicio ||--o{ LugarServicio : "se hace en"
    Lugar ||--o{ Franja : "abre en"
    Lugar ||--o{ Excepcion : "cambia en"

    Clienta ||--o{ Reserva : hace
    Lugar ||--o{ Reserva : ocupa
    Servicio ||--o{ Reserva : "servicio base"
    Retiro |o--o{ Reserva : "retiro, si lleva"
    Reserva ||--o{ ReservaExtra : lleva
    Extra ||--o{ ReservaExtra : "aparece en"

    Salon {
        integer id PK
        text nombre
    }

    Servicio {
        integer id PK
        integer salonId FK,UK
        text nombre UK
        integer precio "pesos enteros"
        integer duracionMinutos
        boolean activo "default true"
    }

    Extra {
        integer id PK
        integer salonId FK,UK
        text nombre UK
        integer precio "pesos enteros"
        integer duracionMinutos
        boolean activo "default true"
    }

    Retiro {
        integer id PK
        integer salonId FK,UK
        text nombre UK
        integer precio "pesos enteros"
        integer duracionMinutos
        boolean activo "default true"
    }

    ServicioExtra {
        integer servicioId PK,FK
        integer extraId PK,FK
    }

    Lugar {
        integer id PK
        integer salonId FK,UK
        text nombre UK
        boolean activo "default true"
    }

    LugarServicio {
        integer lugarId PK,FK
        integer servicioId PK,FK
    }

    Franja {
        integer id PK
        integer lugarId FK
        integer diaSemana "0 domingo a 6 sábado"
        integer desdeMinuto "minutos desde la medianoche"
        integer hastaMinuto
    }

    Excepcion {
        integer id PK
        integer lugarId FK
        date fecha
        integer desdeMinuto
        integer hastaMinuto
        TipoExcepcion tipo "ABRE o CIERRA"
    }

    Clienta {
        integer id PK
        integer salonId FK,UK
        text telefono UK
        text nombre
    }

    Reserva {
        integer id PK
        integer clientaId FK
        integer lugarId FK
        date fecha
        integer inicioMinuto
        integer finMinuto
        integer servicioId FK
        integer servicioPrecio "copia al reservar"
        integer retiroId FK "opcional"
        integer retiroPrecio "copia al reservar, opcional"
        timestamp creadaEn "default now()"
    }

    ReservaExtra {
        integer reservaId PK,FK
        integer extraId PK,FK
        integer precio "copia al reservar"
    }
```

## Índices y restricciones

Además de la clave primaria de cada tabla, que Postgres indexa sola:

| Tabla | Índice o restricción | Qué garantiza |
|---|---|---|
| `Servicio`, `Extra`, `Retiro`, `Lugar` | Único `(salonId, nombre)` | Que no haya dos con el mismo nombre en el mismo salón |
| `Clienta` | Único `(salonId, telefono)` | Que la misma clienta no esté cargada dos veces |
| `Reserva` | `EXCLUDE` con índice GiST sobre `(lugarId, fecha, [inicio, fin))` | **Que dos reservas del mismo lugar, el mismo día, no se superpongan** ([ADR-007](adr/007-un-horario-un-turno-sin-superposicion.md)) |
| `Franja` | `CHECK` del día entre 0 y 6, y de `0 ≤ desde < hasta ≤ 1440` | Una franja que no existe |
| `Excepcion` | `CHECK` de `0 ≤ desde < hasta ≤ 1440` | Una excepción que no existe |
| `Reserva` | `CHECK` de `0 ≤ inicio < fin ≤ 1440` | Un turno que no existe |
| `Reserva` | `CHECK` de que el retiro y su precio estén los dos o ninguno | Un retiro sin precio |

Todas las claves foráneas son `ON DELETE RESTRICT`: no se puede borrar algo que
otra fila usa. Para sacar algo del catálogo o una mesa de la grilla, se
desactiva con `activo`.

El `EXCLUDE` y los `CHECK` **no aparecen en `schema.prisma`**, porque Prisma no los
sabe expresar: están escritos a mano en las migraciones.
