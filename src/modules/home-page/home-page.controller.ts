import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HomePageService } from './home-page.service';
import {
  CreateHomePageDto,
  CreateServiceStandsOutDto,
} from './dto/create-home-page.dto';
import {
  UpdateHomePageDto,
  UpdateServiceStandsOutDto,
} from './dto/update-home-page.dto';

@ApiTags('Home Page')
@Controller('home-page')
export class HomePageController {
  constructor(private readonly homePageService: HomePageService) {}

  // Home Page endpoints
  @Get()
  @ApiOperation({ summary: 'Get home page content' })
  getHomePage() {
    return this.homePageService.getHomePage();
  }

  @Get('complete')
  @ApiOperation({ summary: 'Get complete home page data including services' })
  getCompleteHomePageData() {
    return this.homePageService.getCompleteHomePageData();
  }

  @Post()
  @ApiOperation({ summary: 'Create home page content' })
  createHomePage(@Body() createDto: CreateHomePageDto) {
    return this.homePageService.createHomePage(createDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current home page content' })
  updateCurrentHomePage(@Body() updateDto: UpdateHomePageDto) {
    return this.homePageService.updateCurrentHomePage(updateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update home page by ID' })
  updateHomePage(
    @Param('id') id: string,
    @Body() updateDto: UpdateHomePageDto,
  ) {
    return this.homePageService.updateHomePage(id, updateDto);
  }

  // Services endpoints
  @Get('services')
  @ApiOperation({ summary: 'Get all service stands out items' })
  getAllServices() {
    return this.homePageService.getAllServices();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID' })
  getServiceById(@Param('id') id: string) {
    return this.homePageService.getServiceById(id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a new service' })
  createService(@Body() createDto: CreateServiceStandsOutDto) {
    return this.homePageService.createService(createDto);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update service by ID' })
  updateService(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceStandsOutDto,
  ) {
    return this.homePageService.updateService(id, updateDto);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete service by ID' })
  deleteService(@Param('id') id: string) {
    return this.homePageService.deleteService(id);
  }
}
