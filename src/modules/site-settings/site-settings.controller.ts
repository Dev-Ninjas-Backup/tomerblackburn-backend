import { Controller, Get, Post, Body, Patch, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { CreateSiteSettingsDto } from './dto/create-site-settings.dto';
import {
  UpdateSiteSettingsDto,
  SiteSettingsResponseDto,
} from './dto/update-site-settings.dto';

@ApiTags('Site Settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get site settings',
    description:
      'Retrieve current site settings (creates defaults if none exist)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Site settings retrieved successfully',
    type: SiteSettingsResponseDto,
  })
  getSettings() {
    return this.siteSettingsService.getSettings();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update site settings',
    description: 'Create site settings or update if already exists',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Site settings created/updated successfully',
    type: SiteSettingsResponseDto,
  })
  create(@Body() createDto: CreateSiteSettingsDto) {
    return this.siteSettingsService.create(createDto);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update site settings',
    description: 'Update current site settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Site settings updated successfully',
    type: SiteSettingsResponseDto,
  })
  update(@Body() updateDto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.updateCurrent(updateDto);
  }
}
