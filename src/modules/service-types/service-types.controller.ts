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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { ServiceTypeEntity } from './entities/service-type.entity';

@ApiTags('Service Types')
@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new service type',
    description:
      'Create a new service type (e.g., Bathroom Renovation, Kitchen Renovation)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service type created successfully',
    type: ServiceTypeEntity,
    schema: {
      example: {
        message: 'Service type created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Bathroom Renovation',
          description: 'Complete bathroom renovation services',
          displayOrder: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service type with this name already exists',
  })
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all service types',
    description: 'Retrieve all service types with optional filtering by status',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of service types retrieved successfully',
    type: [ServiceTypeEntity],
    schema: {
      example: {
        message: 'Service types retrieved successfully',
        count: 2,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Bathroom Renovation',
            description: 'Complete bathroom renovation services',
            displayOrder: 0,
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Kitchen Renovation',
            description: 'Complete kitchen renovation services',
            displayOrder: 1,
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool =
      isActive === undefined ? undefined : isActive === 'true';
    return this.serviceTypesService.findAll(isActiveBool);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get only active service types',
    description:
      'Retrieve all active service types with their active service categories',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active service types retrieved successfully',
    type: [ServiceTypeEntity],
    schema: {
      example: {
        message: 'Active service types retrieved successfully',
        count: 2,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Bathroom Renovation',
            description: 'Complete bathroom renovation services',
            displayOrder: 0,
            isActive: true,
            serviceCategories: [
              {
                id: 'cat-123',
                name: 'Half Bath',
                isActive: true,
              },
            ],
          },
        ],
      },
    },
  })
  findActive() {
    return this.serviceTypesService.findActive();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get service type by ID',
    description: 'Retrieve a specific service type by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Service type unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type found',
    type: ServiceTypeEntity,
    schema: {
      example: {
        message: 'Service type retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Bathroom Renovation',
          description: 'Complete bathroom renovation services',
          displayOrder: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service type not found',
  })
  findOne(@Param('id') id: string) {
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update service type',
    description: 'Update an existing service type by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Service type unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type updated successfully',
    type: ServiceTypeEntity,
    schema: {
      example: {
        message: 'Service type updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Bathroom Renovation',
          description: 'Updated description',
          displayOrder: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service type with this name already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
  ) {
    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete service type',
    description:
      'Permanently delete a service type. Cannot delete if there are existing service categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service type unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type deleted successfully',
    schema: {
      example: {
        message: 'Service type deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete service type with existing service categories',
  })
  remove(@Param('id') id: string) {
    return this.serviceTypesService.remove(id);
  }
}
