import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'RESPONSIVE COMMUNICATION',
          description: 'Service title',
        },
        description: {
          type: 'string',
          example:
            "We follow up, follow through, and stay in touch, so you always know what's going on with your project.",
          description: 'Service description',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Image file (optional). If provided, will be uploaded and imageId will be automatically set.',
        },
      },
      required: ['title', 'description'],
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  createService(
    @Body() createDto: CreateServiceStandsOutDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.homePageService.createService(createDto, image);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update service by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'RESPONSIVE COMMUNICATION',
          description: 'Service title',
        },
        description: {
          type: 'string',
          example:
            "We follow up, follow through, and stay in touch, so you always know what's going on with your project.",
          description: 'Service description',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Image file (optional). If provided, will be uploaded and imageId will be automatically set.',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  updateService(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceStandsOutDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.homePageService.updateService(id, updateDto, image);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete service by ID' })
  deleteService(@Param('id') id: string) {
    return this.homePageService.deleteService(id);
  }
}
