import { Module } from '@nestjs/common';
import { AgendaModule } from '../agenda/agenda.module';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { GrillaModule } from '../grilla/grilla.module';
import { ClaveGuard } from './clave.guard';
import { PanelController } from './panel.controller';
import { PanelService } from './panel.service';

/**
 * Todo lo de la dueña entra por acá, detrás de la clave del salón. No es dueño
 * de ninguna tabla: le pide el día a la grilla y a la agenda, los nombres al
 * catálogo, y a la grilla que guarde lo que abre.
 */
@Module({
  imports: [AgendaModule, GrillaModule, CatalogoModule],
  controllers: [PanelController],
  providers: [PanelService, ClaveGuard],
})
export class PanelModule {}
