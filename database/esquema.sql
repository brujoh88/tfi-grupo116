-- Esquema completo de la base de datos, generado con generar-esquema.sh.
-- No se edita a mano: la fuente son las migraciones de backend/prisma/migrations/.

-- ============================================================================
-- Migración 20260825133434_catalogo
-- ============================================================================

-- CreateTable
CREATE TABLE "Salon" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "salonId" INTEGER NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "salonId" INTEGER NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retiro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "salonId" INTEGER NOT NULL,

    CONSTRAINT "Retiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioExtra" (
    "servicioId" INTEGER NOT NULL,
    "extraId" INTEGER NOT NULL,

    CONSTRAINT "ServicioExtra_pkey" PRIMARY KEY ("servicioId","extraId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_salonId_nombre_key" ON "Servicio"("salonId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_salonId_nombre_key" ON "Extra"("salonId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Retiro_salonId_nombre_key" ON "Retiro"("salonId", "nombre");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retiro" ADD CONSTRAINT "Retiro_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioExtra" ADD CONSTRAINT "ServicioExtra_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioExtra" ADD CONSTRAINT "ServicioExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- Migración 20260924162428_grilla
-- ============================================================================

-- CreateEnum
CREATE TYPE "TipoExcepcion" AS ENUM ('ABRE', 'CIERRA');

-- CreateTable
CREATE TABLE "Lugar" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "salonId" INTEGER NOT NULL,

    CONSTRAINT "Lugar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LugarServicio" (
    "lugarId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "LugarServicio_pkey" PRIMARY KEY ("lugarId","servicioId")
);

-- CreateTable
CREATE TABLE "Franja" (
    "id" SERIAL NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "desdeMinuto" INTEGER NOT NULL,
    "hastaMinuto" INTEGER NOT NULL,
    "lugarId" INTEGER NOT NULL,

    CONSTRAINT "Franja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Excepcion" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "desdeMinuto" INTEGER NOT NULL,
    "hastaMinuto" INTEGER NOT NULL,
    "tipo" "TipoExcepcion" NOT NULL,
    "lugarId" INTEGER NOT NULL,

    CONSTRAINT "Excepcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lugar_salonId_nombre_key" ON "Lugar"("salonId", "nombre");

-- AddForeignKey
ALTER TABLE "Lugar" ADD CONSTRAINT "Lugar_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LugarServicio" ADD CONSTRAINT "LugarServicio_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LugarServicio" ADD CONSTRAINT "LugarServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Franja" ADD CONSTRAINT "Franja_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Excepcion" ADD CONSTRAINT "Excepcion_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Controles escritos a mano: Prisma no sabe expresar CHECK en schema.prisma.
-- Que la base rechace una franja "de 13 a 9" o un día 9 es la regla 4 de
-- docs/arquitectura.md: el invariante lo garantiza la base, no el código.
-- 1440 son los minutos de un día.
ALTER TABLE "Franja"
  ADD CONSTRAINT "franja_dia_valido"    CHECK ("diaSemana" BETWEEN 0 AND 6),
  ADD CONSTRAINT "franja_horas_validas" CHECK (0 <= "desdeMinuto" AND "desdeMinuto" < "hastaMinuto" AND "hastaMinuto" <= 1440);

ALTER TABLE "Excepcion"
  ADD CONSTRAINT "excepcion_horas_validas" CHECK (0 <= "desdeMinuto" AND "desdeMinuto" < "hastaMinuto" AND "hastaMinuto" <= 1440);

-- ============================================================================
-- Migración 20260925140051_reservas
-- ============================================================================

-- CreateTable
CREATE TABLE "Clienta" (
    "id" SERIAL NOT NULL,
    "telefono" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "salonId" INTEGER NOT NULL,

    CONSTRAINT "Clienta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "inicioMinuto" INTEGER NOT NULL,
    "finMinuto" INTEGER NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientaId" INTEGER NOT NULL,
    "lugarId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "servicioPrecio" INTEGER NOT NULL,
    "retiroId" INTEGER,
    "retiroPrecio" INTEGER,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaExtra" (
    "reservaId" INTEGER NOT NULL,
    "extraId" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,

    CONSTRAINT "ReservaExtra_pkey" PRIMARY KEY ("reservaId","extraId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clienta_salonId_telefono_key" ON "Clienta"("salonId", "telefono");

-- AddForeignKey
ALTER TABLE "Clienta" ADD CONSTRAINT "Clienta_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clientaId_fkey" FOREIGN KEY ("clientaId") REFERENCES "Clienta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_retiroId_fkey" FOREIGN KEY ("retiroId") REFERENCES "Retiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaExtra" ADD CONSTRAINT "ReservaExtra_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaExtra" ADD CONSTRAINT "ReservaExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Controles escritos a mano: Prisma no sabe expresar CHECK ni EXCLUDE.

-- "Un horario, un turno": dos reservas de la misma mesa, el mismo día, no
-- pueden tener horarios que se superpongan. No alcanza con una unicidad sobre
-- el inicio: 10:00–12:15 y 11:00–12:00 empiezan distinto y se pisan igual.
-- El rango es [inicio, fin): un turno que termina a las 11 y otro que empieza a
-- las 11 no se superponen. Si dos clientas reservan a la vez, la base recibe
-- las escrituras de a una y rechaza la segunda. btree_gist deja mezclar el "="
-- de la mesa y el día con el "&&" (se superponen) de los rangos.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reserva"
  ADD CONSTRAINT "reserva_sin_superposicion" EXCLUDE USING gist (
    "lugarId" WITH =,
    "fecha" WITH =,
    int4range("inicioMinuto", "finMinuto") WITH &&
  );

-- Las mismas horas válidas que en la grilla: 1440 son los minutos de un día.
ALTER TABLE "Reserva"
  ADD CONSTRAINT "reserva_horas_validas" CHECK (0 <= "inicioMinuto" AND "inicioMinuto" < "finMinuto" AND "finMinuto" <= 1440);

-- El retiro y su precio van juntos: o están los dos, o no está ninguno.
ALTER TABLE "Reserva"
  ADD CONSTRAINT "reserva_retiro_con_precio" CHECK (("retiroId" IS NULL) = ("retiroPrecio" IS NULL));
