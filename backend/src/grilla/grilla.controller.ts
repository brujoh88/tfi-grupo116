import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GrillaService } from './grilla.service';
import { ConsultarGrillaDto, GrillaDelDia } from './grilla.types';

@Controller('grilla')
export class GrillaController {
  constructor(private readonly grilla: GrillaService) {}

  /**
   * Qué tiene abierto cada lugar un día, contando lo que la dueña abrió y
   * cerró. No dice qué horarios quedan libres: eso es la disponibilidad, que
   * además descuenta los turnos ya reservados.
   */
  @Get()
  @ApiResponse({
    status: 400,
    description: 'La fecha no viene, está mal escrita o no existe.',
  })
  async delDia(@Query() consulta: ConsultarGrillaDto): Promise<GrillaDelDia> {
    return this.grilla.delDia(consulta);
  }
}
