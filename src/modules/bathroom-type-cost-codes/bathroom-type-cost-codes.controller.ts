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
import { BathroomTypeCostCodesService } from './bathroom-type-cost-codes.service';
import { CreateBathroomTypeCostCodeDto } from './dto/create-bathroom-type-cost-code.dto';
import { UpdateBathroomTypeCostCodeDto } from './dto/update-bathroom-type-cost-code.dto';
import { BathroomTypeCostCodeResponseDto } from './dto/bathroom-type-cost-code-response.dto';
import { BulkAssignCostCodesDto } from './dto/bulk-assign-cost-codes.dto';

@ApiTags('Bathroom Type Cost Codes')
@Controller('bathroom-type-cost-codes')
export class BathroomTypeCostCodesController {
  constructor(
    private readonly bathroomTypeCostCodesService: BathroomTypeCostCodesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Assign a cost code to a bathroom type',
    description:
      'Create a new assignment linking a cost code to a bathroom type',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code assigned successfully',
    type: BathroomTypeCostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code assigned to bathroom type successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          bathroomTypeId: 'bt-id-123',
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
  create(@Body() createDto: CreateBathroomTypeCostCodeDto) {
    return this.bathroomTypeCostCodesService.create(createDto);
  }

  @Post('bulk-assign')
  @ApiOperation({
    summary: 'Assign multiple cost codes to a bathroom type',
    description: 'Bulk assign multiple cost codes to a single bathroom type',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost codes assigned successfully',
    type: [BathroomTypeCostCodeResponseDto],
    schema: {
      example: {
        message: 'Successfully assigned 5 cost code(s) to bathroom type',
        count: 5,
        data: [
          {
            id: 'assignment-id-1',
            bathroomTypeId: 'bt-id-123',
            costCodeId: 'cc-id-456',
            isIncludedInBase: true,
          },
        ],
      },
    },
  })
  bulkAssign(@Body() bulkAssignDto: BulkAssignCostCodesDto) {
    return this.bathroomTypeCostCodesService.bulkAssign(bulkAssignDto);
  }

  @Post('sync-from-cost-codes')
  @ApiOperation({
    summary: 'Auto-sync cost codes to bathroom types',
    description:
      'Automatically sync cost codes to bathroom types based on appliesToFp/Tps/Tpt/Tp flags',
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
    return this.bathroomTypeCostCodesService.syncFromCostCodes();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bathroom type cost code assignments',
    description:
      'Retrieve all assignments with optional filtering by bathroom type or cost code',
  })
  @ApiQuery({
    name: 'bathroomTypeId',
    required: false,
    description: 'Filter by bathroom type ID',
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
    type: [BathroomTypeCostCodeResponseDto],
    schema: {
      example: {
        message: 'Bathroom type cost code assignments retrieved successfully',
        count: 10,
        data: [
          {
            id: 'assignment-id-1',
            bathroomTypeId: 'bt-id-123',
            costCodeId: 'cc-id-456',
            isIncludedInBase: true,
            isRequired: false,
          },
        ],
      },
    },
  })
  findAll(
    @Query('bathroomTypeId') bathroomTypeId?: string,
    @Query('costCodeId') costCodeId?: string,
  ) {
    return this.bathroomTypeCostCodesService.findAll(
      bathroomTypeId,
      costCodeId,
    );
  }

  @Get('bathroom-type/:bathroomTypeId')
  @ApiOperation({
    summary: 'Get all cost codes for a bathroom type',
    description: 'Retrieve all cost codes assigned to a specific bathroom type',
  })
  @ApiParam({
    name: 'bathroomTypeId',
    description: 'Bathroom type unique identifier',
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
    description: 'List of cost codes for bathroom type',
    type: [BathroomTypeCostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes for bathroom type retrieved successfully',
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
  findByBathroomType(
    @Param('bathroomTypeId') bathroomTypeId: string,
    @Query('includeOptions') includeOptions?: string,
  ) {
    const includeOpts = includeOptions === 'true';
    return this.bathroomTypeCostCodesService.findByBathroomType(
      bathroomTypeId,
      includeOpts,
    );
  }

  @Get('bathroom-type/:bathroomTypeId/grouped')
  @ApiOperation({
    summary: 'Get cost codes for a bathroom type grouped by category',
    description:
      'Retrieve cost codes organized by their categories for a specific bathroom type',
  })
  @ApiParam({
    name: 'bathroomTypeId',
    description: 'Bathroom type unique identifier',
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
  findGroupedByCategory(@Param('bathroomTypeId') bathroomTypeId: string) {
    return this.bathroomTypeCostCodesService.findGroupedByCategory(
      bathroomTypeId,
    );
  }

  @Get('cost-code/:costCodeId')
  @ApiOperation({
    summary: 'Get all bathroom types that use this cost code',
    description:
      'Retrieve all bathroom types that have this cost code assigned',
  })
  @ApiParam({
    name: 'costCodeId',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of bathroom types using this cost code',
    type: [BathroomTypeCostCodeResponseDto],
    schema: {
      example: {
        message: 'Bathroom types for cost code retrieved successfully',
        count: 3,
        data: [
          {
            id: 'assignment-id-1',
            bathroomType: {
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
    return this.bathroomTypeCostCodesService.findByCostCode(costCodeId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get assignment by ID',
    description:
      'Retrieve a specific bathroom type cost code assignment by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment found',
    type: BathroomTypeCostCodeResponseDto,
    schema: {
      example: {
        message: 'Assignment retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          bathroomTypeId: 'bt-id-123',
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
    return this.bathroomTypeCostCodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update assignment',
    description: 'Update an existing bathroom type cost code assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Assignment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment updated successfully',
    type: BathroomTypeCostCodeResponseDto,
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
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBathroomTypeCostCodeDto,
  ) {
    return this.bathroomTypeCostCodesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove cost code from bathroom type',
    description:
      'Permanently remove a cost code assignment from a bathroom type',
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
    return this.bathroomTypeCostCodesService.remove(id);
  }

  @Delete('bathroom-type/:bathroomTypeId/cost-code/:costCodeId')
  @ApiOperation({
    summary: 'Remove specific cost code from bathroom type',
    description:
      'Remove a cost code assignment using bathroom type ID and cost code ID',
  })
  @ApiParam({
    name: 'bathroomTypeId',
    description: 'Bathroom type unique identifier',
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
    @Param('bathroomTypeId') bathroomTypeId: string,
    @Param('costCodeId') costCodeId: string,
  ) {
    return this.bathroomTypeCostCodesService.removeByIds(
      bathroomTypeId,
      costCodeId,
    );
  }
}
