import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrafficService } from './traffic.service';

@ApiTags('Traffic')
@Controller('traffic')
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get paginated visitor sessions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSessions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.trafficService.getSessions(
      page ? Math.max(1, parseInt(page)) : 1,
      limit ? Math.min(100, Math.max(1, parseInt(limit))) : 20,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate traffic statistics' })
  getStats() {
    return this.trafficService.getStats();
  }
}
