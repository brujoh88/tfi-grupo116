import { abiertoElDia, Tramo } from './franjas';

// Las horas en minutos, para leer los casos como los diría la dueña.
const h = (hora: number, minutos = 0) => hora * 60 + minutos;
const tramo = (desde: number, hasta: number): Tramo => ({ desde, hasta });

describe('abiertoElDia', () => {
  it('sin excepciones, devuelve la plantilla tal cual', () => {
    const plantilla = [tramo(h(9), h(13)), tramo(h(15), h(19))];

    expect(abiertoElDia(plantilla, [], [])).toEqual(plantilla);
  });

  it('un cierre en el medio parte la franja en dos', () => {
    expect(
      abiertoElDia([tramo(h(9), h(13))], [], [tramo(h(10), h(11))]),
    ).toEqual([tramo(h(9), h(10)), tramo(h(11), h(13))]);
  });

  it('un cierre que tapa la franja entera la hace desaparecer', () => {
    expect(
      abiertoElDia([tramo(h(9), h(13))], [], [tramo(h(8), h(14))]),
    ).toEqual([]);
  });

  it('un cierre que toca un borde recorta solo ese lado', () => {
    expect(
      abiertoElDia([tramo(h(9), h(13))], [], [tramo(h(12), h(14))]),
    ).toEqual([tramo(h(9), h(12))]);
  });

  it('abre un día que en la plantilla está cerrado', () => {
    // El domingo a la noche la dueña ve el lunes vacío y abre de 9 a 12.
    expect(abiertoElDia([], [tramo(h(9), h(12))], [])).toEqual([
      tramo(h(9), h(12)),
    ]);
  });

  it('una apertura pegada a la plantilla la estira sin dejar un corte', () => {
    // Si quedaran 9–13 y 13–14 separados, un turno de 12:30 a 13:30 no
    // entraría en ninguno aunque el lugar esté abierto sin interrupción.
    expect(
      abiertoElDia([tramo(h(9), h(13))], [tramo(h(13), h(14))], []),
    ).toEqual([tramo(h(9), h(14))]);
  });

  it('si una apertura y un cierre se pisan, gana el cierre', () => {
    expect(
      abiertoElDia([], [tramo(h(9), h(12))], [tramo(h(10), h(11))]),
    ).toEqual([tramo(h(9), h(10)), tramo(h(11), h(12))]);
  });

  it('no depende del orden en que vengan las franjas', () => {
    const plantilla = [tramo(h(15), h(19)), tramo(h(9), h(13))];

    expect(abiertoElDia(plantilla, [], [])).toEqual([
      tramo(h(9), h(13)),
      tramo(h(15), h(19)),
    ]);
  });
});
