import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { Comprobante, ReservarDto } from './reservas.types';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservas: ReservasService) {}

  /**
   * Reserva el horario que eligió la clienta y contesta el comprobante. Se
   * identifica con nombre y teléfono, sin registro. Manda el total que vio: si
   * el precio cambió en el medio, no se reserva.
   */
  @Post()
  @ApiResponse({
    status: 400,
    description:
      'El cuerpo está mal formado, el armado no lo permite el catálogo, el día ' +
      'ya pasó o está demasiado adelante, o el teléfono no es válido.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El precio cambió desde que la clienta lo vio, el horario no está ' +
      'disponible, o se acaba de ocupar.',
  })
  async reservar(@Body() pedido: ReservarDto): Promise<Comprobante> {
    return this.reservas.reservar(pedido);
  }
}
