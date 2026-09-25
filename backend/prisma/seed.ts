// Los datos de ejemplo: el catálogo y la grilla de un salón inventado. Es lo que
// el salón carga una sola vez; no hay clientas, reservas ni excepciones.
// Nombres, precios y horarios son ficticios. Las duraciones coinciden con los
// ejemplos de la bitácora y los ADR: soft gel con retiro y francesita, 2 h 15.
//
// Se corre sobre una base vacía (`npx prisma db seed`). Si el salón ya tiene
// catálogo, no toca nada: pisar datos que alguien cargó a mano es peor que no
// sembrar.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const LUNES_A_VIERNES = [1, 2, 3, 4, 5];
const SABADO = 6;

// Las horas en minutos desde la medianoche, como las guarda la base.
const h = (hora: number) => hora * 60;

const SERVICIOS = [
  { nombre: 'Esmaltado semipermanente', duracionMinutos: 45, precio: 12000 },
  { nombre: 'Soft gel', duracionMinutos: 90, precio: 18000 },
  { nombre: 'Kapping gel', duracionMinutos: 90, precio: 17000 },
  { nombre: 'Manicura tradicional', duracionMinutos: 45, precio: 8000 },
  { nombre: 'Pedicura', duracionMinutos: 60, precio: 13000 },
  { nombre: 'Limpieza facial', duracionMinutos: 60, precio: 20000 },
  { nombre: 'Perfilado de cejas', duracionMinutos: 30, precio: 7000 },
  { nombre: 'Lifting de pestañas', duracionMinutos: 60, precio: 16000 },
];

const UÑAS = ['Esmaltado semipermanente', 'Soft gel', 'Kapping gel'];

const EXTRAS = [
  { nombre: 'Francesita', duracionMinutos: 15, precio: 3000, vaCon: UÑAS },
  {
    nombre: 'Diseño en dos uñas',
    duracionMinutos: 15,
    precio: 2500,
    vaCon: [...UÑAS, 'Pedicura'],
  },
  { nombre: 'Strass', duracionMinutos: 10, precio: 2000, vaCon: UÑAS },
  {
    nombre: 'Hidratación de manos',
    duracionMinutos: 15,
    precio: 3000,
    vaCon: ['Esmaltado semipermanente', 'Manicura tradicional'],
  },
  {
    nombre: 'Máscara hidratante',
    duracionMinutos: 15,
    precio: 5000,
    vaCon: ['Limpieza facial'],
  },
  {
    nombre: 'Tinte de cejas',
    duracionMinutos: 15,
    precio: 4000,
    vaCon: ['Perfilado de cejas', 'Lifting de pestañas'],
  },
];

// El esquema no ata un retiro a un servicio, y está bien: una clienta puede
// venir con kapping de otro lado y pasarse a soft gel.
const RETIROS = [
  { nombre: 'Retiro de semipermanente', duracionMinutos: 15, precio: 2000 },
  { nombre: 'Retiro de soft gel', duracionMinutos: 30, precio: 3000 },
  { nombre: 'Retiro de kapping', duracionMinutos: 30, precio: 3500 },
];

const MESA_DE_UÑAS = {
  hace: [...UÑAS, 'Manicura tradicional'],
  franjas: [
    ...LUNES_A_VIERNES.flatMap((dia) => [
      { diaSemana: dia, desde: h(9), hasta: h(13) },
      { diaSemana: dia, desde: h(15), hasta: h(19) },
    ]),
    { diaSemana: SABADO, desde: h(9), hasta: h(14) },
  ],
};

const LUGARES = [
  { nombre: 'Mesa de uñas 1', ...MESA_DE_UÑAS },
  { nombre: 'Mesa de uñas 2', ...MESA_DE_UÑAS },
  {
    nombre: 'Sillón de pedicura',
    hace: ['Pedicura'],
    franjas: [2, 4, SABADO].map((dia) => ({
      diaSemana: dia,
      desde: h(10),
      hasta: h(18),
    })),
  },
  {
    nombre: 'Camilla',
    hace: ['Limpieza facial', 'Perfilado de cejas', 'Lifting de pestañas'],
    franjas: LUNES_A_VIERNES.map((dia) => ({
      diaSemana: dia,
      desde: h(10),
      hasta: h(18),
    })),
  },
];

async function sembrar(prisma: PrismaClient, salonId: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.salon.upsert({
      where: { id: salonId },
      update: {},
      create: { id: salonId, nombre: 'Salón de estética' },
    });

    if ((await tx.servicio.count({ where: { salonId } })) > 0) {
      console.log(`El salón ${salonId} ya tiene catálogo: no se siembra nada.`);
      return;
    }

    // Los ids los pone la base; se buscan por nombre para armar los vínculos.
    const idDelServicio = new Map<string, number>();
    for (const servicio of SERVICIOS) {
      const creado = await tx.servicio.create({
        data: { ...servicio, salonId },
      });
      idDelServicio.set(creado.nombre, creado.id);
    }
    const id = (nombre: string) => {
      const encontrado = idDelServicio.get(nombre);
      if (encontrado === undefined) {
        throw new Error(`El seed nombra un servicio que no existe: ${nombre}`);
      }
      return encontrado;
    };

    for (const { vaCon, ...extra } of EXTRAS) {
      await tx.extra.create({
        data: {
          ...extra,
          salonId,
          servicios: {
            create: vaCon.map((nombre) => ({ servicioId: id(nombre) })),
          },
        },
      });
    }

    await tx.retiro.createMany({
      data: RETIROS.map((retiro) => ({ ...retiro, salonId })),
    });

    for (const { nombre, hace, franjas } of LUGARES) {
      await tx.lugar.create({
        data: {
          nombre,
          salonId,
          servicios: { create: hace.map((s) => ({ servicioId: id(s) })) },
          franjas: {
            create: franjas.map(({ diaSemana, desde, hasta }) => ({
              diaSemana,
              desdeMinuto: desde,
              hastaMinuto: hasta,
            })),
          },
        },
      });
    }

    console.log(
      `Salón ${salonId}: ${SERVICIOS.length} servicios, ${EXTRAS.length} extras, ` +
        `${RETIROS.length} retiros y ${LUGARES.length} lugares con su grilla.`,
    );
  });
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  const salonId = Number(process.env.SALON_ID);
  if (!connectionString || !Number.isInteger(salonId) || salonId <= 0) {
    throw new Error('Faltan DATABASE_URL o SALON_ID. Ver .env.example.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    await sembrar(prisma, salonId);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
