import { Controller, Get } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { Catalogo } from './catalogo.types';

@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get()
  async consultar(): Promise<Catalogo> {
    return this.catalogo.consultar();
  }
}
