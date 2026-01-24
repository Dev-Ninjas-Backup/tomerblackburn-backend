import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EstimatorPageService } from './estimator-page.service';
import { CreateEstimatorPageDto } from './dto/create-estimator-page.dto';
import { UpdateEstimatorPageDto } from './dto/update-estimator-page.dto';
import { CreateHowItWorksStepDto } from './dto/create-how-it-works-step.dto';
import { UpdateHowItWorksStepDto } from './dto/update-how-it-works-step.dto';
import { CreateWhyChooseUsFeatureDto } from './dto/create-why-choose-us-feature.dto';
import { UpdateWhyChooseUsFeatureDto } from './dto/update-why-choose-us-feature.dto';

@ApiTags('Estimator Page')
@Controller('estimator-page')
export class EstimatorPageController {
  constructor(private readonly estimatorPageService: EstimatorPageService) {}

  @Get()
  @ApiOperation({ summary: 'Get estimator page data' })
  @ApiResponse({
    status: 200,
    description: 'Estimator page retrieved successfully',
  })
  getEstimatorPage() {
    return this.estimatorPageService.getEstimatorPage();
  }

  @Post()
  @ApiOperation({ summary: 'Create estimator page' })
  @ApiResponse({ status: 201, description: 'Estimator page created' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Estimate Your Bathroom Remodel Cost',
        },
        description: {
          type: 'string',
          example:
            'Professional bathroom remodels - real quotes, competitive pricing',
        },
        howItWorksTitle: {
          type: 'string',
          example: 'How It Works',
        },
        whyChooseUsTitle: {
          type: 'string',
          example: 'Why Choose Us',
        },
        backgroundImage: {
          type: 'string',
          format: 'binary',
          description: 'Background image file (optional)',
        },
      },
      required: ['title', 'description'],
    },
  })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  createEstimatorPage(
    @Body() createDto: CreateEstimatorPageDto,
    @UploadedFile() backgroundImage?: Express.Multer.File,
  ) {
    return this.estimatorPageService.createEstimatorPage(
      createDto,
      backgroundImage,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update estimator page by ID' })
  @ApiParam({ name: 'id', description: 'Estimator page ID' })
  @ApiResponse({ status: 200, description: 'Estimator page updated' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        howItWorksTitle: { type: 'string' },
        whyChooseUsTitle: { type: 'string' },
        backgroundImage: {
          type: 'string',
          format: 'binary',
          description: 'Background image file (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  updateEstimatorPage(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstimatorPageDto,
    @UploadedFile() backgroundImage?: Express.Multer.File,
  ) {
    return this.estimatorPageService.updateEstimatorPage(
      id,
      updateDto,
      backgroundImage,
    );
  }

  @Put()
  @ApiOperation({ summary: 'Update current estimator page' })
  @ApiResponse({ status: 200, description: 'Estimator page updated' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        howItWorksTitle: { type: 'string' },
        whyChooseUsTitle: { type: 'string' },
        backgroundImage: {
          type: 'string',
          format: 'binary',
          description: 'Background image file (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  updateCurrentEstimatorPage(
    @Body() updateDto: UpdateEstimatorPageDto,
    @UploadedFile() backgroundImage?: Express.Multer.File,
  ) {
    return this.estimatorPageService.updateCurrentEstimatorPage(
      updateDto,
      backgroundImage,
    );
  }

  @Get('how-it-works')
  @ApiOperation({ summary: 'Get all How It Works steps' })
  @ApiResponse({ status: 200, description: 'Steps retrieved successfully' })
  getAllHowItWorksSteps() {
    return this.estimatorPageService.getAllHowItWorksSteps();
  }

  @Get('how-it-works/:id')
  @ApiOperation({ summary: 'Get How It Works step by ID' })
  @ApiParam({ name: 'id', description: 'Step ID' })
  @ApiResponse({ status: 200, description: 'Step retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Step not found' })
  getHowItWorksStepById(@Param('id') id: string) {
    return this.estimatorPageService.getHowItWorksStepById(id);
  }

  @Post('how-it-works')
  @ApiOperation({ summary: 'Create How It Works step' })
  @ApiResponse({ status: 201, description: 'Step created successfully' })
  createHowItWorksStep(@Body() createDto: CreateHowItWorksStepDto) {
    return this.estimatorPageService.createHowItWorksStep(createDto);
  }

  @Put('how-it-works/:id')
  @ApiOperation({ summary: 'Update How It Works step' })
  @ApiParam({ name: 'id', description: 'Step ID' })
  @ApiResponse({ status: 200, description: 'Step updated successfully' })
  updateHowItWorksStep(
    @Param('id') id: string,
    @Body() updateDto: UpdateHowItWorksStepDto,
  ) {
    return this.estimatorPageService.updateHowItWorksStep(id, updateDto);
  }

  @Delete('how-it-works/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete How It Works step' })
  @ApiParam({ name: 'id', description: 'Step ID' })
  @ApiResponse({ status: 200, description: 'Step deleted successfully' })
  deleteHowItWorksStep(@Param('id') id: string) {
    return this.estimatorPageService.deleteHowItWorksStep(id);
  }

  @Get('why-choose-us')
  @ApiOperation({ summary: 'Get all Why Choose Us features' })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  getAllWhyChooseUsFeatures() {
    return this.estimatorPageService.getAllWhyChooseUsFeatures();
  }

  @Get('why-choose-us/:id')
  @ApiOperation({ summary: 'Get Why Choose Us feature by ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  getWhyChooseUsFeatureById(@Param('id') id: string) {
    return this.estimatorPageService.getWhyChooseUsFeatureById(id);
  }

  @Post('why-choose-us')
  @ApiOperation({ summary: 'Create Why Choose Us feature' })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Transparent Pricing',
        },
        description: {
          type: 'string',
          example: "See exactly what you're paying for with itemized estimates",
        },
        order: {
          type: 'number',
          example: 0,
        },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Icon file (optional)',
        },
      },
      required: ['title', 'description'],
    },
  })
  @UseInterceptors(FileInterceptor('icon'))
  createWhyChooseUsFeature(
    @Body() createDto: CreateWhyChooseUsFeatureDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return this.estimatorPageService.createWhyChooseUsFeature(createDto, icon);
  }

  @Put('why-choose-us/:id')
  @ApiOperation({ summary: 'Update Why Choose Us feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        order: { type: 'number' },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Icon file (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('icon'))
  updateWhyChooseUsFeature(
    @Param('id') id: string,
    @Body() updateDto: UpdateWhyChooseUsFeatureDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return this.estimatorPageService.updateWhyChooseUsFeature(
      id,
      updateDto,
      icon,
    );
  }

  @Delete('why-choose-us/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Why Choose Us feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature deleted successfully' })
  deleteWhyChooseUsFeature(@Param('id') id: string) {
    return this.estimatorPageService.deleteWhyChooseUsFeature(id);
  }

  @Get('complete')
  @ApiOperation({
    summary: 'Get complete estimator page data (all sections combined)',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete estimator page data retrieved',
  })
  getCompleteEstimatorPageData() {
    return this.estimatorPageService.getCompleteEstimatorPageData();
  }
}
