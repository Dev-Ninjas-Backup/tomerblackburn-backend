import { Module } from '@nestjs/common';
import { TrafficGateway } from './traffic.gateway';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';

@Module({
  controllers: [TrafficController],
  providers: [TrafficGateway, TrafficService],
})
export class TrafficModule {}
