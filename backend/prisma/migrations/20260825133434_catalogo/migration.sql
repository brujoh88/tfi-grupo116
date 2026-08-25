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
