import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceCostCodesService } from './service-cost-codes.service';
import { CreateServiceCostCodeDto } from './dto/create-service-cost-code.dto';
import { UpdateServiceCostCodeDto } from './dto/update-service-cost-code.dto';
import { ServiceCostCodeResponseDto } from './dto/service-cost-code-response.dto';
import { BulkAssignCostCodesDto } from './dto/bulk-assign-cost-codes.dto';

@ApiTags('Service Cost Codes')
@Controller('service-cost-codes')
export class ServiceCostCodesController {
  constructor(
    private readonly serviceCostCodesService: ServiceCostCodesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Assign a cost code to a service',
    description: 'Create a new assignment linking a cost code to a service',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code assigned successfully',
    type: ServiceCostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code assigned to service successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          serviceId: 'bt-id-123',
          costCodeId: 'cc-id-456',
          isIncludedInBase: true,
          isRequired: false,
          defaultQuantity: 1,
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
    description: 'This assignment already exists',
  })
  create(@Body() createDto: CreateServiceCostCodeDto) {
    return this.serviceCostCodesService.create(createDto);
  }

  @Post('bulk-assign')
  @ApiOperation({
    summary: 'Assign multiple cost codes to a service',
    description: 'Bulk assign multiple cost codes to a single service',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost codes assigned successfully',
    type: [ServiceCostCodeResponseDto],
    schema: {
      example: {
        message: 'Successfully assigned 5 cost code(s) to service',
        count: 5,
        data: [
          {
            id: 'assignment-id-1',
            serviceId: 'bt-id-123',
            costCodeId: 'cc-id-456',
            isIncludedInBase: true,
          },
        ],
      },
    },
  })
  bulkAssign(@Body() bulkAssignDto: BulkAssignCostCodesDto) {
    return this.serviceCostCodesService.bulkAssign(bulkAssignDto);
  }

  @Post('sync-from-cost-codes')
  @ApiOperation({
    summary: 'Auto-sync cost codes to services',
    description:
      'Automatically sync cost codes to services based on appliesToFp/Tps/Tpt/Tp flags',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost codes synced successfully',
    schema: {
      example: {
        message: 'Synced 25 cost code assignment(s)',
        count: 25,
      },
    },
  })
  syncFromCostCodes() {
    return this.serviceCostCodesService.syncFromCostCodes();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all service cost code assignments',
    description:
      'Retrieve all assignments with optional filtering by service or cost code',
  })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    description: 'Filter by service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'costCodeId',
    required: false,
    description: 'Filter by cost code ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assignments',
    type: [ServiceCostCodeResponseDto],
    schema: {
      example: {
        message: 'Service cost code assignments retrieved successfully',
        count: 10,
        data: [
          {
            id: 'assignment-id-1',
            serviceId: 'bt-id-123',
            costCodeId: 'cc-id-456',
            isIncludedInBase: true,
            isRequired: false,
          },
        ],
      },
    },
  })
  findAll(
    @Query('serviceId') serviceId?: string,
    @Query('costCodeId') costCodeId?: string,
  ) {
    return this.serviceCostCodesService.findAll(serviceId, costCodeId);
  }

  @Get('service/:serviceId')
  @ApiOperation({
    summary: 'Get all cost codes for a service',
    description: 'Retrieve all cost codes assigned to a specific service',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeOptions',
    required: false,
    type: Boolean,
    description: 'Include cost code options in the response',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost codes for service',
    type: [ServiceCostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes for service retrieved successfully',
        count: 15,
        data: [
          {
            id: 'assignment-id-1',
            costCode: {
              id: 'cc-id-456',
              code: 'FP-D-1',
              name: 'Demolition',
            },
            isIncludedInBase: true,
          },
        ],
      },
    },
  })
  findByService(
    @Param('serviceId') serviceId: string,
    @Query('includeOptions') includeOptions?: string,
  ) {
    const includeOpts = includeOptions === 'true';
    return this.serviceCostCodesService.findByService(serviceId, includeOpts);
  }

  @Get('service/:serviceId/grouped')
  @ApiOperation({
    summary: 'Get cost codes for a service grouped by category',
    description:
      'Retrieve cost codes organized by their categories for a specific service',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost codes grouped by category',
    schema: {
      example: {
        message: 'Cost codes grouped by category retrieved successfully',
        count: 5,
        data: [
          {
            categoryId: 'cat-id-1',
            categoryName: 'Demolition',
            categorySlug: 'demolition',
            displayOrder: 0,
            costCodes: [
              {
                id: 'cc-id-1',
                code: 'FP-D-1',
                name: 'Demo Item',
                isIncludedInBase: true,
              },
            ],
          },
        ],
      },
    },
  })
  findGroupedByCategory(@Param('serviceId') serviceId: string) {
    return this.serviceCostCodesService.findGroupedByCategory(serviceId);
  }

  @Get('cost-code/:costCodeId')
  @ApiOperation({
    summary: 'Get all services that use this cost code',
    description: 'Retrieve all services that have this cost code assigned',
  })
  @ApiParam({
    name: 'costCodeId',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of services using this cost code',
    type: [ServiceCostCodeResponseDto],
    schema: {
      example: {
        message: 'Services for cost code retrieved successfully',
        count: 3,
        data: [
          {
            id: 'assignment-id-1',
            service: {
              id: 'bt-id-123',
              code: 'FP',
              name: 'Full Package',
            },
            isIncludedInBase: true,
          },
        ],
      },
    },
  })
  findByCostCode(@Param('costCodeId') costCodeId: string) {
    return this.serviceCostCodesService.findByCostCode(costCodeId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get assignment by ID',
    description:
      'Retrieve a specific service cost code assignment by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment found',
    type: ServiceCostCodeResponseDto,
    schema: {
      example: {
        message: 'Assignment retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          serviceId: 'bt-id-123',
          costCodeId: 'cc-id-456',
          isIncludedInBase: true,
          isRequired: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignment not found',
  })
  findOne(@Param('id') id: string) {
    return this.serviceCostCodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update assignment',
    description: 'Update an existing service cost code assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment updated successfully',
    type: ServiceCostCodeResponseDto,
    schema: {
      example: {
        message: 'Assignment updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          isIncludedInBase: false,
          isRequired: true,
          defaultQuantity: 2,
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateServiceCostCodeDto) {
    return this.serviceCostCodesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove cost code from service',
    description: 'Permanently remove a cost code assignment from a service',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment removed successfully',
    schema: {
      example: {
        message: 'Assignment removed successfully',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.serviceCostCodesService.remove(id);
  }

  @Delete('service/:serviceId/cost-code/:costCodeId')
  @ApiOperation({
    summary: 'Remove specific cost code from service',
    description:
      'Remove a cost code assignment using service ID and cost code ID',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'costCodeId',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment removed successfully',
    schema: {
      example: {
        message: 'Assignment removed successfully',
      },
    },
  })
  removeByIds(
    @Param('serviceId') serviceId: string,
    @Param('costCodeId') costCodeId: string,
  ) {
    return this.serviceCostCodesService.removeByIds(serviceId, costCodeId);
  }
}
