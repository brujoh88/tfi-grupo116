import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';
import { ClaveGuard, ENCABEZADO_CLAVE } from './clave.guard';
import { PanelService } from './panel.service';
import { AbrirHorarioDto, DiaDelPanel, VerDiaDto } from './panel.types';

@Controller('panel')
// La clave se controla acá, en la puerta: vale para todo lo que está abajo.
@UseGuards(ClaveGuard)
@ApiHeader({ name: ENCABEZADO_CLAVE, description: 'La clave del salón' })
@ApiResponse({ status: 401, description: 'Falta la clave o no es correcta.' })
export class PanelController {
  constructor(private readonly panel: PanelService) {}

  /**
   * El día del salón para la dueña: cada lugar con los tramos que tiene
   * abiertos y los turnos tomados, con la clienta, su teléfono y qué se hace.
   */
  @Get('dia')
  @ApiResponse({ status: 400, description: 'La fecha está mal formada.' })
  async verDia(@Query() consulta: VerDiaDto): Promise<DiaDelPanel> {
    return this.panel.verDia(consulta.fecha);
  }

  /**
   * Abre un tramo de un lugar un día puntual, aunque la plantilla no lo tenga.
   * Desde ese momento, la disponibilidad lo ofrece a las clientas. Contesta el
   * día como quedó.
   */
  @Post('aperturas')
  @ApiResponse({
    status: 400,
    description:
      'El cuerpo está mal formado, el horario termina antes de empezar, o el ' +
      'lugar no es del salón.',
  })
  async abrir(@Body() apertura: AbrirHorarioDto): Promise<DiaDelPanel> {
    return this.panel.abrir(apertura);
  }
}
