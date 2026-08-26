import { Controller, Get } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { Catalogo } from './catalogo.types';

@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  /** Todo lo que la clienta puede elegir hoy en este salón. */
  @Get()
  async consultar(): Promise<Catalogo> {
    return this.catalogo.consultar();
  }
}
