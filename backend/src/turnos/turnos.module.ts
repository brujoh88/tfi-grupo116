import { Module } from '@nestjs/common';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';

/**
 * Dado lo que la clienta armó, cuánto sale y cuánto dura.
 *
 * No importa `PrismaModule`: no es dueño de ninguna tabla. Todo lo que sabe del
 * catálogo se lo pregunta a `CatalogoService` (regla 1 de dependencia).
 */
@Module({
  imports: [CatalogoModule],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}
