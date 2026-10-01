import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { DisponibilidadService } from './disponibilidad.service';
import {
  ConsultarDisponibilidadDto,
  Disponibilidad,
} from './disponibilidad.types';

@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(private readonly disponibilidad: DisponibilidadService) {}

  /**
   * En qué horarios de un día entra completo el turno que armó la clienta. Cruza
   * la grilla de ese día con los turnos ya tomados. No reserva nada.
   */
  @Post()
  // Es una consulta con cuerpo, como el armado: no crea nada, así que 200.
  @HttpCode(200)
  @ApiResponse({
    status: 400,
    description:
      'El cuerpo está mal formado, el armado no lo permite el catálogo, el día ' +
      'ya pasó, o está más allá de los días que se puede reservar.',
  })
  async consultar(
    @Body() consulta: ConsultarDisponibilidadDto,
  ): Promise<Disponibilidad> {
    return this.disponibilidad.consultar(consulta);
  }
}
