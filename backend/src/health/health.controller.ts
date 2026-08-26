import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** Dice si la API responde y si puede hablar con la base. */
  @Get()
  async estado() {
    return this.health.estado();
  }
}
