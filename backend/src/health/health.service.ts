import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async estado(): Promise<{ api: string; base: string }> {
    await this.prisma.$queryRaw`SELECT 1`;

    return { api: 'ok', base: 'ok' };
  }
}
