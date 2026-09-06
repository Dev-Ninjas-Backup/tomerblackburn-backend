import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { UpdateSeoSettingsDto } from './dto/update-seo-settings.dto';
import { UpdateSeoPageDto } from './dto/update-seo-page.dto';
import { AuthGuard } from '@/common/guards/auth.guard';

@ApiTags('SEO Management')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global SEO settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global SEO settings retrieved successfully',
  })
  getGlobalSettings() {
    return this.seoService.getGlobalSettings();
  }

  @Patch('global')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update global SEO settings (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global SEO settings updated successfully',
  })
  updateGlobalSettings(@Body() dto: UpdateSeoSettingsDto) {
    return this.seoService.updateGlobalSettings(dto);
  }

  @Get('pages')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all configured SEO pages (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SEO pages retrieved successfully',
  })
  getAllPages() {
    return this.seoService.getAllPages();
  }

  @Get('page')
  @ApiOperation({ summary: 'Get SEO metadata for a specific route path' })
  @ApiQuery({ name: 'path', example: '/estimator', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page SEO metadata retrieved successfully',
  })
  getPageByPath(@Query('path') path: string) {
    return this.seoService.getPageByPath(path || '/');
  }

  @Patch('pages/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SEO metadata for a specific page (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page SEO metadata updated successfully',
  })
  updatePage(@Param('id') id: string, @Body() dto: UpdateSeoPageDto) {
    return this.seoService.updatePage(id, dto);
  }

  @Get('bundle')
  @ApiOperation({
    summary: 'Get complete public SEO bundle for Next.js metadata and sitemaps',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SEO bundle retrieved successfully',
  })
  getPublicBundle() {
    return this.seoService.getPublicBundle();
  }
}
