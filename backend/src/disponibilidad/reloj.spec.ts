import { ahoraEnElSalon, diasEntre } from './reloj';

describe('ahoraEnElSalon', () => {
  it('a las 22 de Argentina sigue siendo el mismo día, aunque en UTC ya no', () => {
    // 1 de octubre, 22:30 en Argentina = 2 de octubre, 01:30 UTC.
    expect(ahoraEnElSalon(new Date('2026-10-02T01:30:00Z'))).toEqual({
      fecha: '2026-10-01',
      minuto: 22 * 60 + 30,
    });
  });

  it('a la medianoche del salón, el minuto es cero', () => {
    expect(ahoraEnElSalon(new Date('2026-10-02T03:00:00Z'))).toEqual({
      fecha: '2026-10-02',
      minuto: 0,
    });
  });
});

describe('diasEntre', () => {
  it('cuenta días de calendario, cruzando meses', () => {
    expect(diasEntre('2026-10-01', '2026-11-15')).toBe(45);
  });

  it('da negativo si la fecha ya pasó', () => {
    expect(diasEntre('2026-10-01', '2026-09-30')).toBe(-1);
  });
});
