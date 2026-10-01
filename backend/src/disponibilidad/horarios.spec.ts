import { Tramo } from '../grilla/franjas';
import { horariosLibres } from './horarios';

// Las horas en minutos, para leer los casos como los diría la dueña.
const h = (hora: number, minutos = 0) => hora * 60 + minutos;
const tramo = (desde: number, hasta: number): Tramo => ({ desde, hasta });
const MESA_1 = 1;
const MESA_2 = 2;

/** Solo los inicios, para comparar contra lo que se le ofrece a la clienta. */
const inicios = (horarios: { inicio: number }[]) =>
  horarios.map((x) => x.inicio);

describe('horariosLibres', () => {
  it('ofrece solo los horarios donde el turno entra completo', () => {
    // De 9 a 10 entra uno de 45 a las 9:00; a las 9:30 terminaría 10:15.
    const abierto = new Map([[MESA_1, [tramo(h(9), h(10))]]]);

    expect(inicios(horariosLibres(abierto, new Map(), 45))).toEqual([h(9)]);
  });

  it('saltea lo reservado y ofrece los huecos que quedan', () => {
    // Mesa de 9 a 13 con una reserva de 10:00 a 11:30, turno de 45 minutos.
    const abierto = new Map([[MESA_1, [tramo(h(9), h(13))]]]);
    const ocupado = new Map([[MESA_1, [tramo(h(10), h(11, 30))]]]);

    expect(inicios(horariosLibres(abierto, ocupado, 45))).toEqual([
      h(9),
      h(11, 30),
      h(12),
    ]);
  });

  it('un turno más largo que cualquier hueco no tiene horario', () => {
    // Soft gel con retiro y francesita, 2 h 15, en una franja de 2 horas.
    const abierto = new Map([[MESA_1, [tramo(h(9), h(11))]]]);

    expect(horariosLibres(abierto, new Map(), 135)).toEqual([]);
  });

  it('con dos mesas, alcanza con que una esté libre', () => {
    // La mesa 1 está tomada de 9 a 10; la mesa 2, libre.
    const abierto = new Map([
      [MESA_1, [tramo(h(9), h(11))]],
      [MESA_2, [tramo(h(9), h(11))]],
    ]);
    const ocupado = new Map([[MESA_1, [tramo(h(9), h(10))]]]);

    const horarios = horariosLibres(abierto, ocupado, 60);

    expect(horarios[0]).toEqual({
      inicio: h(9),
      fin: h(10),
      lugarIds: [MESA_2],
    });
    expect(horarios.find((x) => x.inicio === h(10))?.lugarIds).toEqual([
      MESA_1,
      MESA_2,
    ]);
  });

  it('si es hoy, no ofrece lo que ya pasó', () => {
    // Son las 10:50: el primer horario es a las 11:00.
    const abierto = new Map([[MESA_1, [tramo(h(9), h(13))]]]);

    expect(inicios(horariosLibres(abierto, new Map(), 60, h(10, 50)))[0]).toBe(
      h(11),
    );
  });

  it('los inicios van alineados al reloj aunque la franja no', () => {
    // Una franja que arranca 9:15 ofrece desde las 9:30, no 9:15 y 9:45.
    const abierto = new Map([[MESA_1, [tramo(h(9, 15), h(11))]]]);

    expect(inicios(horariosLibres(abierto, new Map(), 30))).toEqual([
      h(9, 30),
      h(10),
      h(10, 30),
    ]);
  });

  it('sin lugares abiertos, no hay horarios', () => {
    expect(horariosLibres(new Map(), new Map(), 45)).toEqual([]);
  });
});
