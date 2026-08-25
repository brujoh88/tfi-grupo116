import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * El único lugar que contesta de qué salón es un pedido.
 *
 * Hoy la respuesta es constante: la API sirve a un salón y cuál es lo fija el
 * despliegue. El día que haya varios, el id va a salir del pedido —del
 * subdominio, del link o de la clave del panel— y el cambio entra acá adentro:
 * los módulos que lo consultan no se enteran.
 */
@Injectable()
export class SalonActualService {
  private readonly salonId: number;

  constructor(config: ConfigService) {
    const configurado = config.get<string>('SALON_ID');
    const salonId = Number(configurado);

    if (!configurado || !Number.isInteger(salonId) || salonId <= 0) {
      throw new Error(
        'Falta SALON_ID o no es un entero positivo. Copiar .env.example a .env y completarla.',
      );
    }

    this.salonId = salonId;
  }

  id(): number {
    return this.salonId;
  }
}
