import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealthCheck() {
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      const dbStatus = 'connected';

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: dbStatus,
          type: 'PostgreSQL',
        },
        developer: {
          name: 'Mirza Saikat Ahmmed',
          email: 'mirzasaikatahmmed@gmail.com',
          github: 'https://github.com/mirzasaikatahmmed',
          portfolio: 'https://mirzasaikatahmmed.com',
        },
        api: {
          version: '1.0.0',
          description: 'Authentication API with JWT',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'disconnected',
          error: error.message,
        },
        developer: {
          name: 'Mirza Saikat Ahmmed',
          email: 'mirzasaikatahmmed@gmail.com',
          github: 'https://github.com/mirzasaikatahmmed',
          portfolio: 'https://mirzasaikatahmmed.com',
        },
        api: {
          version: '1.0.0',
          description: 'Authentication API with JWT',
        },
      };
    }
  }
}
