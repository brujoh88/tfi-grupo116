import { CatalogoService } from './catalogo.service';
import { PrismaService } from '../prisma/prisma.service';
import { SalonActualService } from '../salon/salon-actual.service';

const SALON = 7;

// Filas como las devuelve Prisma. Los servicios llegan con `extras` envuelto en
// la tabla de vínculo: `[{ extra: {...} }]`. Esa forma es la que el service tiene
// que deshacer, y es lo único que se prueba acá.
const corte = { id: 10, nombre: 'Corte', precio: 8000, duracionMinutos: 45 };
const color = { id: 20, nombre: 'Color', precio: 15000, duracionMinutos: 90 };
const hidratacion = {
  id: 30,
  nombre: 'Hidratación',
  precio: 3000,
  duracionMinutos: 15,
};
const brillo = { id: 31, nombre: 'Brillo', precio: 2000, duracionMinutos: 10 };
const retiroDeGel = {
  id: 40,
  nombre: 'Retiro de gel',
  precio: 2500,
  duracionMinutos: 20,
};

/** Con qué salón se llamó a un `findMany`. Mira la primera llamada anotada. */
const salonConsultadoPor = (buscar: jest.Mock): number => {
  const [argumentos] = buscar.mock.calls[0] as [{ where: { salonId: number } }];
  return argumentos.where.salonId;
};

describe('CatalogoService', () => {
  let buscarServicios: jest.Mock;
  let buscarRetiros: jest.Mock;
  let catalogo: CatalogoService;

  // Dobles nuevos en cada caso: si se compartieran, un test arrastraría las
  // llamadas anotadas del anterior y el resultado dependería del orden.
  beforeEach(() => {
    buscarServicios = jest.fn().mockResolvedValue([]);
    buscarRetiros = jest.fn().mockResolvedValue([]);

    const prisma = {
      servicio: { findMany: buscarServicios },
      retiro: { findMany: buscarRetiros },
    } as unknown as PrismaService;

    const salon = { id: () => SALON } as SalonActualService;

    // Sin Nest: la clase solo recibe cosas por constructor, así que se la
    // construye a mano. No hay ruta, ni pipe, ni guard que levantar.
    catalogo = new CatalogoService(prisma, salon);
  });

  describe('consultar', () => {
    it('deja los extras planos: afuera sale la lista, no la tabla de vínculo', async () => {
      buscarServicios.mockResolvedValue([
        { ...corte, extras: [{ extra: hidratacion }, { extra: brillo }] },
      ]);

      const { servicios } = await catalogo.consultar();

      expect(servicios).toEqual([{ ...corte, extras: [hidratacion, brillo] }]);
    });

    it('no deja pasar el envoltorio del vínculo dentro de un extra', async () => {
      buscarServicios.mockResolvedValue([
        { ...corte, extras: [{ extra: hidratacion }] },
      ]);

      const { servicios } = await catalogo.consultar();

      expect(servicios[0].extras[0]).not.toHaveProperty('extra');
    });

    it('un servicio sin extras contesta una lista vacía, no null', async () => {
      buscarServicios.mockResolvedValue([{ ...color, extras: [] }]);

      const { servicios } = await catalogo.consultar();

      // La pantalla recorre `extras` sin preguntar si existe.
      expect(servicios).toEqual([{ ...color, extras: [] }]);
    });

    it('un salón sin nada cargado contesta las dos listas vacías', async () => {
      expect(await catalogo.consultar()).toEqual({
        servicios: [],
        retiros: [],
      });
    });

    it('los retiros salen tal como vienen: no se les inventa extras', async () => {
      buscarRetiros.mockResolvedValue([retiroDeGel]);

      const { retiros } = await catalogo.consultar();

      expect(retiros).toEqual([retiroDeGel]);
    });

    it('pregunta por el salón en lugar de decidirlo por su cuenta', async () => {
      await catalogo.consultar();

      // El día que `id()` lea el salón del pedido, este test avisa si el
      // catálogo dejó de respetarlo. Es lo que compra el ADR-003.
      expect(salonConsultadoPor(buscarServicios)).toBe(SALON);
      expect(salonConsultadoPor(buscarRetiros)).toBe(SALON);
    });
  });
});
