import { Module } from '@nestjs/common';
import { SalonActualService } from './salon-actual.service';

@Module({
  providers: [SalonActualService],
  exports: [SalonActualService],
})
export class SalonModule {}
