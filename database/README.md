# Base de datos

PostgreSQL, con el esquema gestionado por Prisma. El diagrama entidad-relación
está en [`docs/diagrama-er.md`](../docs/diagrama-er.md).

| Archivo | Qué es |
|---|---|
| [`esquema.sql`](esquema.sql) | **El DDL completo**: las doce tablas, sus claves, índices y restricciones, en un solo archivo para leerlo de una vez |
| [`generar-esquema.sh`](generar-esquema.sh) | Regenera `esquema.sql` a partir de las migraciones |

**La fuente son las migraciones**, en
[`backend/prisma/migrations/`](../backend/prisma/migrations/), una por etapa del
esquema. Quedan ahí y no acá porque Prisma las busca al lado de
`schema.prisma`. `esquema.sql` es su suma en orden: no se edita a mano, se
regenera con `./generar-esquema.sh` cada vez que entra una migración.

Incluye lo que `schema.prisma` no muestra: los `CHECK` y la restricción que
impide dos reservas superpuestas en el mismo lugar, escritos a mano en las
migraciones.

**Los datos de ejemplo** —un salón inventado con su catálogo y su grilla— se
cargan con `npx prisma db seed` desde `backend/`. El script es
[`backend/prisma/seed.ts`](../backend/prisma/seed.ts).

Para crear la base desde cero sin Prisma:

```bash
psql "$DATABASE_URL" -f database/esquema.sql
```
