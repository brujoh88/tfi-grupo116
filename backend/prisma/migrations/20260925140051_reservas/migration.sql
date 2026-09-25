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
