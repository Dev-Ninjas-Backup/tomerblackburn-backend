import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma/prisma.service';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return homepage HTML', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await appController.getHomePage(mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/html',
      );
      expect(mockResponse.send).toHaveBeenCalled();
      const htmlContent = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(htmlContent).toContain('bburn_builders_api');
      expect(htmlContent).toContain('BBurn Builders API');
    });
  });

  describe('health', () => {
    it('should return health check data', async () => {
      const mockHealthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 123.45,
        environment: 'test',
        database: {
          status: 'connected',
          type: 'PostgreSQL',
        },
        developer: {
          name: 'Mirza Saikat Ahmmed',
          email: 'mirzasaikatahmmed@gmail.com',
          github: 'https://github.com/mirzasaikatahmmed',
          portfolio: 'https://saikat.com.bd',
        },
        api: {
          version: '1.0.0',
          description: 'Authentication API with JWT',
        },
      };

      jest
        .spyOn(appService, 'getHealthCheck')
        .mockResolvedValue(mockHealthData);

      const result = await appController.getHealthCheck();

      expect(result).toEqual(mockHealthData);
      expect(appService.getHealthCheck).toHaveBeenCalled();
    });
  });
});
