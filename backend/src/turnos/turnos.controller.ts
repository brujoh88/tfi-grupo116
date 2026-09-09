import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { TurnosService } from './turnos.service';
import { ArmarTurnoDto, TurnoArmado } from './turnos.types';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnos: TurnosService) {}

  /**
   * Arma un turno con lo que la clienta eligió y contesta cuánto sale y cuánto
   * dura. No reserva ni guarda nada: es una consulta con cuerpo.
   */
  @Post('armado')
  // Un `POST` en Nest contesta 201 por defecto, y acá no se creó ningún
  // recurso: lo que vuelve es el resultado de un cálculo.
  @HttpCode(200)
  @ApiResponse({
    status: 400,
    description:
      'El cuerpo está mal formado, o la combinación no la permite el catálogo: ' +
      'el servicio no está disponible, un extra no se le puede sumar, viene un ' +
      'extra repetido, o el retiro no está disponible.',
  })
  async armar(@Body() elegido: ArmarTurnoDto): Promise<TurnoArmado> {
    return this.turnos.armar(elegido);
  }
}
