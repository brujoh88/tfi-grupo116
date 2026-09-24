import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalonModule } from '../salon/salon.module';
import { GrillaController } from './grilla.controller';
import { GrillaService } from './grilla.service';

@Module({
  imports: [PrismaModule, SalonModule],
  controllers: [GrillaController],
  providers: [GrillaService],
  exports: [GrillaService],
})
export class GrillaModule {}
