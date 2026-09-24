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
