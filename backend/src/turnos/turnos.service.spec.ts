import { BadRequestException } from '@nestjs/common';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Catalogo } from '../catalogo/catalogo.types';
import { TurnosService } from './turnos.service';

// El catálogo tal como sale de `CatalogoService.consultar()`: ya filtrado por
// salón y por activo, y con los extras compatibles adentro de cada servicio. El
// service de turnos no repite esos filtros, así que el doble tampoco.
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

const CATALOGO: Catalogo = {
  servicios: [
    {
      id: 10,
      nombre: 'Corte',
      precio: 8000,
      duracionMinutos: 45,
      extras: [hidratacion, brillo],
    },
    // Color no admite ningún extra: sirve para probar el rechazo.
    { id: 20, nombre: 'Color', precio: 15000, duracionMinutos: 90, extras: [] },
  ],
  retiros: [retiroDeGel],
};

describe('TurnosService', () => {
  let turnos: TurnosService;

  beforeEach(() => {
    const catalogo = {
      consultar: jest.fn().mockResolvedValue(CATALOGO),
    } as unknown as CatalogoService;

    turnos = new TurnosService(catalogo);
  });

  it('suma el precio y la duración del servicio, los extras y el retiro', async () => {
    const armado = await turnos.armar({
      servicioId: 10,
      extraIds: [30, 31],
      retiroId: 40,
    });

    expect(armado.precio).toBe(8000 + 3000 + 2000 + 2500);
    expect(armado.duracionMinutos).toBe(45 + 15 + 10 + 20);
  });

  it('arma un turno sin extras ni retiro con lo del servicio solo', async () => {
    const armado = await turnos.armar({ servicioId: 20, extraIds: [] });

    expect(armado.precio).toBe(15000);
    expect(armado.duracionMinutos).toBe(90);
    expect(armado.extras).toEqual([]);
    expect(armado.retiro).toBeNull();
  });

  it('devuelve el servicio sin la lista de extras del salón adentro', async () => {
    const armado = await turnos.armar({ servicioId: 10, extraIds: [] });

    expect(armado.servicio).toEqual({
      id: 10,
      nombre: 'Corte',
      precio: 8000,
      duracionMinutos: 45,
    });
  });

  it('devuelve los extras en el orden del catálogo, no en el que llegaron', async () => {
    const armado = await turnos.armar({ servicioId: 10, extraIds: [31, 30] });

    expect(armado.extras.map((extra) => extra.nombre)).toEqual([
      'Hidratación',
      'Brillo',
    ]);
  });

  it('rechaza un servicio que el catálogo no ofrece', async () => {
    await expect(
      turnos.armar({ servicioId: 999, extraIds: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rechaza un extra que no se le puede sumar a ese servicio', async () => {
    // Hidratación existe y está activa, pero es de Corte, no de Color.
    await expect(
      turnos.armar({ servicioId: 20, extraIds: [30] }),
    ).rejects.toThrow(/no se puede sumar a «Color»/);
  });

  it('rechaza el mismo extra dos veces', async () => {
    await expect(
      turnos.armar({ servicioId: 10, extraIds: [30, 30] }),
    ).rejects.toThrow(/repetido/);
  });

  it('rechaza un retiro que el catálogo no ofrece', async () => {
    await expect(
      turnos.armar({ servicioId: 10, extraIds: [], retiroId: 999 }),
    ).rejects.toThrow(/retiro/i);
  });
});
