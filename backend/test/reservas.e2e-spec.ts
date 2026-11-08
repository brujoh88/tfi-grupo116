import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { normalizarTelefono } from '../src/agenda/telefono';
import { AppModule } from '../src/app.module';
import { Catalogo } from '../src/catalogo/catalogo.types';
import { DisponibilidadService } from '../src/disponibilidad/disponibilidad.service';
import { DIAS_HACIA_ADELANTE, Horario } from '../src/disponibilidad/horarios';
import { ahoraEnElSalon } from '../src/disponibilidad/reloj';
import { PrismaService } from '../src/prisma/prisma.service';

// "Un horario, un turno" (ADR-007), contra la base local con el seed: tres
// clientas piden el mismo horario en el mismo instante y hay dos mesas libres.
// Entran dos, una por mesa, y la tercera rebota. Lo que crea, lo borra.
describe('Reservas: un horario, un turno (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const telefonos = ['11 4000-0001', '11 4000-0002', '11 4000-0003'];
  const creadas: number[] = [];

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    // Lo mismo que hace `main.ts`, que acá no corre.
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.reservaExtra.deleteMany({
      where: { reservaId: { in: creadas } },
    });
    await prisma.reserva.deleteMany({ where: { id: { in: creadas } } });
    await prisma.clienta.deleteMany({
      where: { telefono: { in: telefonos.map((t) => normalizarTelefono(t)!) } },
    });
    await app.close();
  });

  it('tres pedidos simultáneos con dos mesas libres: entran dos y el tercero rebota', async () => {
    const servidor = app.getHttpServer();
    const respuesta = await request(servidor).get('/catalogo').expect(200);
    const servicio = (respuesta.body as Catalogo).servicios.find(
      (s) => s.nombre === 'Esmaltado semipermanente',
    )!;

    // Un día y una hora donde el turno entra en exactamente dos mesas. Se busca
    // en vez de fijarlo: una fecha escrita a mano queda en el pasado.
    const { fecha, horario } = await buscarHorarioConDosMesas(servicio.id);

    const pedido = (telefono: string, nombre: string) =>
      request(servidor).post('/reservas').send({
        servicioId: servicio.id,
        extraIds: [],
        fecha,
        inicio: horario.inicio,
        nombre,
        telefono,
        total: servicio.precio,
      });

    const respuestas = await Promise.all([
      pedido(telefonos[0], 'Ana'),
      pedido(telefonos[1], 'Bea'),
      pedido(telefonos[2], 'Caro'),
    ]);
    const entraron = respuestas.filter((r) => r.status === 201);
    const rebotaron = respuestas.filter((r) => r.status === 409);
    creadas.push(...entraron.map((r) => (r.body as { id: number }).id));

    expect(entraron).toHaveLength(2);
    expect(rebotaron).toHaveLength(1);
    expect((rebotaron[0].body as { message: string }).message).toBe(
      'Ese horario se acaba de ocupar',
    );

    // En la base: una reserva en cada mesa, ninguna encimada.
    const guardadas = await prisma.reserva.findMany({
      where: { id: { in: creadas } },
    });
    expect(new Set(guardadas.map((r) => r.lugarId)).size).toBe(2);
  });

  async function buscarHorarioConDosMesas(
    servicioId: number,
  ): Promise<{ fecha: string; horario: Horario }> {
    const disponibilidad = app.get(DisponibilidadService);
    const hoy = Date.parse(`${ahoraEnElSalon().fecha}T00:00:00Z`);
    for (let dia = 1; dia <= DIAS_HACIA_ADELANTE; dia++) {
      const fecha = new Date(hoy + dia * 86_400_000).toISOString().slice(0, 10);
      const { horarios } = await disponibilidad.libres({
        servicioId,
        extraIds: [],
        fecha,
      });
      const horario = horarios.find((h) => h.lugarIds.length === 2);
      if (horario) return { fecha, horario };
    }
    throw new Error(
      'No hay ningún horario con dos mesas libres en la base local',
    );
  }
});
