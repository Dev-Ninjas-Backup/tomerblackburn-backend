import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BathroomTypesService } from './bathroom-types.service';
import { CreateBathroomTypeDto } from './dto/create-bathroom-type.dto';
import {
  UpdateBathroomTypeDto,
  BathroomTypeResponseDto,
} from './dto/update-bathroom-type.dto';

@ApiTags('Bathroom Types')
@Controller('bathroom-types')
export class BathroomTypesController {
  constructor(private readonly bathroomTypesService: BathroomTypesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new bathroom type',
    description: 'Creates a new bathroom type with optional image upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'FP',
          maxLength: 10,
          description: 'Unique code for bathroom type',
        },
        name: {
          type: 'string',
          example: 'Four Piece',
          maxLength: 100,
          description: 'Name of bathroom type',
        },
        fullDescription: {
          type: 'string',
          example: 'Toilet + Sink + Shower + Tub',
          description: 'Full description',
        },
        basePrice: {
          type: 'number',
          example: 15000.0,
          description: 'Base price',
        },
        isActive: {
          type: 'boolean',
          example: true,
          description: 'Active status',
        },
        displayOrder: {
          type: 'number',
          example: 1,
          description: 'Display order',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (optional)',
        },
      },
      required: ['code', 'name', 'basePrice'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bathroom type created successfully',
    type: BathroomTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bathroom type with this code already exists',
  })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createBathroomTypeDto: CreateBathroomTypeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.bathroomTypesService.create(createBathroomTypeDto, image);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bathroom types',
    description:
      'Retrieve all bathroom types with optional filtering by active status',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (true/false)',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of bathroom types retrieved successfully',
    type: [BathroomTypeResponseDto],
    schema: {
      example: {
        message: 'Bathroom types retrieved successfully',
        count: 2,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'FP',
            name: 'Four Piece',
            fullDescription: 'Toilet + Sink + Shower + Tub',
            basePrice: 15000.0,
            isActive: true,
            displayOrder: 1,
          },
        ],
      },
    },
  })
  findAll(@Query('isActive') isActive?: string) {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.bathroomTypesService.findAll(filter);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active bathroom types for customer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active bathroom types',
    type: [BathroomTypeResponseDto],
  })
  findActive() {
    return this.bathroomTypesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bathroom type by ID' })
  @ApiParam({ name: 'id', description: 'Bathroom type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bathroom type found',
    type: BathroomTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bathroom type not found',
  })
  findOne(@Param('id') id: string) {
    return this.bathroomTypesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get bathroom type by code' })
  @ApiParam({
    name: 'code',
    description: 'Bathroom type code (FP, TPS, TPT, TP)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bathroom type found',
    type: BathroomTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bathroom type not found',
  })
  findByCode(@Param('code') code: string) {
    return this.bathroomTypesService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update bathroom type',
    description: 'Update an existing bathroom type with optional image upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Bathroom type UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'FP',
          description: 'Unique code',
        },
        name: {
          type: 'string',
          example: 'Four Piece Deluxe',
          description: 'Name',
        },
        fullDescription: {
          type: 'string',
          example: 'Toilet + Sink + Shower + Tub with premium fixtures',
          description: 'Full description',
        },
        basePrice: {
          type: 'number',
          example: 18000.0,
          description: 'Base price',
        },
        isActive: {
          type: 'boolean',
          example: true,
          description: 'Active status',
        },
        displayOrder: {
          type: 'number',
          example: 1,
          description: 'Display order',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'New image file (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bathroom type updated successfully',
    type: BathroomTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bathroom type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bathroom type with this code already exists',
  })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateBathroomTypeDto: UpdateBathroomTypeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.bathroomTypesService.update(id, updateBathroomTypeDto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bathroom type' })
  @ApiParam({ name: 'id', description: 'Bathroom type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bathroom type deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bathroom type not found',
  })
  remove(@Param('id') id: string) {
    return this.bathroomTypesService.remove(id);
  }
}
