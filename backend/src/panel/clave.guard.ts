import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import { Request } from 'express';

/** El encabezado en el que el panel manda la clave en cada pedido. */
export const ENCABEZADO_CLAVE = 'x-clave-panel';

/**
 * La puerta del panel: deja pasar solo si el pedido trae la clave del salón
 * (PDR-003). Una sola clave, sin usuarios: la guarda el entorno, en
 * `PANEL_CLAVE`. Si no está configurada, no entra nadie.
 */
@Injectable()
export class ClaveGuard implements CanActivate {
  private readonly clave: string | undefined;

  constructor(config: ConfigService) {
    this.clave = config.get<string>('PANEL_CLAVE') || undefined;
  }

  canActivate(contexto: ExecutionContext): boolean {
    const recibida = contexto
      .switchToHttp()
      .getRequest<Request>()
      .header(ENCABEZADO_CLAVE);
    if (!this.clave || !recibida || !iguales(recibida, this.clave)) {
      throw new UnauthorizedException('La clave del panel no es correcta');
    }
    return true;
  }
}

/**
 * Compara sin delatar por el tiempo cuántos caracteres coincidieron. Se
 * comparan los hashes para que los dos lados tengan el mismo largo.
 */
function iguales(a: string, b: string): boolean {
  const hash = (texto: string) => createHash('sha256').update(texto).digest();
  return timingSafeEqual(hash(a), hash(b));
}
