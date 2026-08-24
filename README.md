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

## Tecnologías

| Pieza | Tecnología |
|---|---|
| Backend | NestJS (TypeScript) |
| Base de datos | PostgreSQL con Prisma |
| Frontend | React con Vite |
| Despliegue del frontend | Vercel |
| Despliegue del backend | Railway |
| Base de datos gestionada | Neon |

La justificación de cada elección y las alternativas descartadas están en la
sección 3 de la propuesta.

## Estructura del repositorio

```
backend/             la API en NestJS
  prisma/            el esquema de la base de datos
  src/               el código de la API
    health/          endpoint de estado
    prisma/          la conexión a la base
docs/                documentación del proyecto y entregas de la cátedra
  adr/               las decisiones de arquitectura, con su porqué
docker-compose.yml   PostgreSQL para desarrollo
```

`frontend/` se agrega cuando arranque React. La API y las pantallas son dos
aplicaciones separadas: el porqué está en
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

# 4. La API, en modo desarrollo
npm run start:dev
```

Para comprobar que quedó andando:

```bash
curl http://localhost:3000/health
# {"api":"ok","base":"ok"}
```

Esa respuesta significa que la API levantó **y** que pudo consultar la base.

### Detalles que conviene saber

- **La base se publica en el puerto 5433** del host, no en el 5432, para no
  chocar con otro PostgreSQL que ya esté corriendo. Adentro del contenedor sigue
  siendo el 5432.
- **El cliente de Prisma no está en el repositorio**: se genera solo al instalar
  (script `postinstall`), a partir de `prisma/schema.prisma`.
- **Prisma 7** necesita un *driver adapter* (`@prisma/adapter-pg`). La mayoría de
  los tutoriales están escritos para Prisma 6, donde eso no existía.
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
