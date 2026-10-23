import { normalizarTelefono } from './telefono';

describe('normalizarTelefono', () => {
  it('con y sin el 9 de celular, es la misma clienta', () => {
    expect(normalizarTelefono('11 5555-1234')).toBe('+541155551234');
    expect(normalizarTelefono('+54 9 11 5555 1234')).toBe('+541155551234');
  });

  it('entiende el 0 de la característica y el 15', () => {
    expect(normalizarTelefono('011 15 5555-1234')).toBe('+541155551234');
    expect(normalizarTelefono('(0351) 15-555-1234')).toBe('+543515551234');
  });

  it('rechaza lo que no es un teléfono', () => {
    expect(normalizarTelefono('1234')).toBeNull();
    expect(normalizarTelefono('abc')).toBeNull();
  });
});
