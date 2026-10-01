# TFI - Grupo 116

Trabajo Final Integrador — Tecnicatura Universitaria en Programación (UTN).

Sistema de turnos para un salón de estética.

## El proyecto

El salón da sus turnos a mano: la clienta escribe por Instagram o WhatsApp,
alguien le contesta qué horarios quedan libres, y el turno se anota. La
disponibilidad se publica como una imagen que hay que actualizar cada vez que
algo cambia.

Este sistema permite que la clienta arme su turno y reserve sola desde el
celular, sin registrarse, y que el salón administre su agenda sin depender de
contestar mensajes.

La propuesta completa —problema, alcance, stack y plan de trabajo— está en
[`docs/propuesta.md`](docs/propuesta.md).

El avance se sigue en el
[tablero del proyecto](https://trello.com/b/uxJIQLjU): una tarjeta por pieza,
etiquetada según la etapa de entrega a la que corresponde.

## Entregas

### 2.ª entrega — Esquema de la base de datos y listado de módulos

| Qué | Dónde |
|---|---|
| **Diagrama entidad-relación** | [`docs/diagrama-er.md`](docs/diagrama-er.md): las doce tablas —catálogo, grilla y reservas— con campos, tipos, claves, relaciones, índices y restricciones |
| **Scripts de la base de datos** | [`database/`](database/): el DDL completo en `esquema.sql`. La fuente son las migraciones de [`backend/prisma/migrations/`](backend/prisma/migrations/) |
| **Listado de módulos** | [`docs/modulos.md`](docs/modulos.md): los módulos funcionales, con su descripción, prioridad y entrega |
| **Arquitectura** | [`docs/arquitectura.md`](docs/arquitectura.md): el estilo elegido, los módulos de la API, quién es dueño de cada tabla y las reglas de dependencia. Las tecnologías y su justificación, en la sección 3 de la [propuesta](docs/propuesta.md) |
| **Las decisiones, con su porqué** | [`docs/adr/`](docs/adr/), abajo |
| **Datos de ejemplo** | [`backend/prisma/seed.ts`](backend/prisma/seed.ts): un salón inventado con su catálogo y su grilla, para probar la API en `/docs` (ver [Instalación](#instalación)) |

| ADR | Decide |
|---|---|
| [001](docs/adr/001-dos-aplicaciones-separadas.md) | La API y las pantallas son dos aplicaciones separadas |
| [002](docs/adr/002-catalogo-en-tres-tablas.md) | Servicios, extras y retiros van en tres tablas, no en una |
| [003](docs/adr/003-el-salon-sale-del-entorno.md) | De qué salón es un pedido lo contesta un solo lugar, y hoy sale del entorno |
| [004](docs/adr/004-monolito-modular-por-dominio.md) | La API es un monolito modular por dominio |
| [005](docs/adr/005-el-turno-armado-se-calcula.md) | El turno armado se calcula, no se guarda |
| [006](docs/adr/006-la-grilla-son-lugares-abiertos-por-franjas.md) | La grilla son lugares abiertos por franjas, no horarios fijos |
| [007](docs/adr/007-un-horario-un-turno-sin-superposicion.md) | "Un horario, un turno" lo garantiza la base con una restricción de no superposición |

## Tecnologías

| Pieza | Tecnología |
|---|---|
| Backend | NestJS (TypeScript) |
| Base de datos | PostgreSQL con Prisma |
| Documentación de la API | Swagger (OpenAPI) |
| Frontend | React con Vite |
| Despliegue del frontend | Vercel |
| Despliegue del backend | Railway |
| Base de datos gestionada | Neon |

La justificación de cada elección y las alternativas descartadas están en la
sección 3 de la propuesta.

## Estructura del repositorio

```
backend/             la API en NestJS
  prisma/            el esquema, las migraciones y los datos de ejemplo
  src/               el código de la API
    catalogo/        lo que la clienta puede elegir
    grilla/          qué tiene abierto cada lugar un día
    health/          endpoint de estado
    prisma/          la conexión a la base
    salon/           a qué salón sirve la API
    turnos/          cuánto sale y cuánto dura un turno armado
database/            el DDL completo del esquema, generado de las migraciones
docs/                documentación del proyecto y entregas de la cátedra
  adr/               las decisiones de arquitectura, con su porqué
frontend/            las pantallas en React con Vite (tercera etapa)
docker-compose.yml   PostgreSQL para desarrollo
```

La API y las pantallas son dos aplicaciones separadas: el porqué está en
[`docs/adr/001-dos-aplicaciones-separadas.md`](docs/adr/001-dos-aplicaciones-separadas.md).

## Instalación

Hacen falta **Node 22 o superior** y **Docker** con Compose.

```bash
# 1. La base de datos, en un contenedor
docker compose up -d

# 2. Las dependencias de la API
cd backend
npm install

# 3. La configuración local
cp .env.example .env

# 4. Las tablas, y los datos de ejemplo
npx prisma migrate deploy
npx prisma db seed

# 5. La API, en modo desarrollo
npm run start:dev
```

Para comprobar que quedó andando:

```bash
curl http://localhost:3000/health
# {"api":"ok","base":"ok"}
```

Esa respuesta significa que la API levantó **y** que pudo consultar la base.

La API se prueba entera en **http://localhost:3000/docs**, sin frontend: cada
endpoint se ejecuta desde ahí. Las rutas y lo que devuelve cada una se generan
desde el código en cada compilación, así que reflejan lo que está corriendo.

### Detalles que conviene saber

- **La base se publica en el puerto 5433** del host, no en el 5432, para no
  chocar con otro PostgreSQL que ya esté corriendo. Adentro del contenedor sigue
  siendo el 5432.
- **El cliente de Prisma no está en el repositorio**: se genera solo al instalar
  (script `postinstall`), a partir de `prisma/schema.prisma`.
- **Prisma 7** necesita un *driver adapter* (`@prisma/adapter-pg`). La mayoría de
  los tutoriales están escritos para Prisma 6, donde eso no existía.
- **Los datos de ejemplo son inventados**: un salón ficticio con su catálogo y su
  grilla (`prisma/seed.ts`). El seed solo carga sobre un salón vacío; si ya tiene
  catálogo, no toca nada.
- Los datos sobreviven a `docker compose down`. Para borrarlos de verdad:
  `docker compose down -v`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | La API, recargando al guardar |
| `npm run build` | Compila a `dist/` |
| `npm run test:e2e` | Prueba que `/health` responda contra la base real |
| `npx prisma generate` | Regenera el cliente de Prisma |

## Equipo

| | |
|---|---|
| **Grupo** | 116 |
| **Integrantes** | Gustavo Tiseira · Nicolás Viruel |
| **Tutor** | Santiago Fonzo |
