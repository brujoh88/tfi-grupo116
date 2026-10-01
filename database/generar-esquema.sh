#!/usr/bin/env bash
# Regenera esquema.sql juntando las migraciones en orden. Las migraciones son la
# fuente: este archivo es una foto para leer el esquema entero de una vez.
set -euo pipefail
cd "$(dirname "$0")"
{
  echo "-- Esquema completo de la base de datos, generado con generar-esquema.sh."
  echo "-- No se edita a mano: la fuente son las migraciones de backend/prisma/migrations/."
  for m in ../backend/prisma/migrations/*/migration.sql; do
    echo
    echo "-- ============================================================================"
    echo "-- Migración $(basename "$(dirname "$m")")"
    echo "-- ============================================================================"
    echo
    cat "$m"
  done
} > esquema.sql
echo "esquema.sql regenerado."
