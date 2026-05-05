import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HearAboutUsService } from './hear-about-us.service';
import {
  CreateHearAboutUsOptionDto,
  UpdateHearAboutUsOptionDto,
  UpdateHearAboutUsSettingDto,
} from './dto/hear-about-us.dto';

@ApiTags('Hear About Us')
@Controller('hear-about-us')
export class HearAboutUsController {
  constructor(private readonly service: HearAboutUsService) {}

  // ── Public endpoints (estimator) ─────────────────────────────────────────

  @Get('setting')
  @ApiOperation({ summary: 'Get feature setting (public)' })
  getSetting() {
    return this.service.getSetting();
  }

  @Get('options/active')
  @ApiOperation({ summary: 'Get active options (public)' })
  getActiveOptions() {
    return this.service.getActiveOptions();
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  @Get('options')
  @ApiOperation({ summary: 'Get all options (admin)' })
  getAllOptions() {
    return this.service.getAllOptions();
  }

  @Post('options')
  @ApiOperation({ summary: 'Create option' })
  createOption(@Body() dto: CreateHearAboutUsOptionDto) {
    return this.service.createOption(dto);
  }

  @Patch('setting')
  @ApiOperation({ summary: 'Update feature setting' })
  updateSetting(@Body() dto: UpdateHearAboutUsSettingDto) {
    return this.service.updateSetting(dto);
  }

  @Patch('options/reorder')
  @ApiOperation({ summary: 'Reorder options' })
  reorderOptions(@Body() body: { items: { id: string; displayOrder: number }[] }) {
    return this.service.reorderOptions(body.items);
  }

  @Patch('options/:id')
  @ApiOperation({ summary: 'Update option' })
  updateOption(@Param('id') id: string, @Body() dto: UpdateHearAboutUsOptionDto) {
    return this.service.updateOption(id, dto);
  }

  @Delete('options/:id')
  @ApiOperation({ summary: 'Delete option' })
  deleteOption(@Param('id') id: string) {
    return this.service.deleteOption(id);
  }
}
