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
import { CostCodeOptionsService } from './cost-code-options.service';
import { CreateCostCodeOptionDto } from './dto/create-cost-code-option.dto';
import { UpdateCostCodeOptionDto } from './dto/update-cost-code-option.dto';
import { CostCodeOptionResponseDto } from './dto/cost-code-option-response.dto';
import { BulkCreateCostCodeOptionsDto } from './dto/bulk-create-cost-code-options.dto';

@ApiTags('Cost Code Options')
@Controller('cost-code-options')
export class CostCodeOptionsController {
  constructor(
    private readonly costCodeOptionsService: CostCodeOptionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new cost code option',
    description: 'Create a new option for a cost code with price modifier',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code option created successfully',
    type: CostCodeOptionResponseDto,
    schema: {
      example: {
        message: 'Cost code option created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          costCodeId: 'cost-code-id-123',
          optionName: 'Size',
          optionValue: 'Large',
          priceModifier: 150,
          finalPrice: 650,
          isDefault: false,
          displayOrder: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code not found',
  })
  create(@Body() createCostCodeOptionDto: CreateCostCodeOptionDto) {
    return this.costCodeOptionsService.create(createCostCodeOptionDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Create multiple cost code options at once',
    description: 'Bulk create multiple options for a single cost code',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code options created successfully',
    type: [CostCodeOptionResponseDto],
    schema: {
      example: {
        message: 'Cost code options retrieved successfully',
        count: 3,
        data: [
          {
            id: 'option-1',
            optionName: 'Size',
            optionValue: 'Small',
            priceModifier: 0,
            finalPrice: 500,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  bulkCreate(@Body() bulkCreateDto: BulkCreateCostCodeOptionsDto) {
    return this.costCodeOptionsService.bulkCreate(bulkCreateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cost code options',
    description:
      'Retrieve all cost code options with optional filtering by cost code ID',
  })
  @ApiQuery({
    name: 'costCodeId',
    required: false,
    description: 'Filter by cost code ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost code options',
    type: [CostCodeOptionResponseDto],
    schema: {
      example: {
        message: 'Cost code options retrieved successfully',
        count: 5,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            costCodeId: 'cost-code-id-123',
            optionName: 'Size',
            optionValue: 'Large',
            priceModifier: 150,
            finalPrice: 650,
            isDefault: false,
            displayOrder: 0,
          },
        ],
      },
    },
  })
  findAll(@Query('costCodeId') costCodeId?: string) {
    return this.costCodeOptionsService.findAll(costCodeId);
  }

  @Get('cost-code/:costCodeId')
  @ApiOperation({
    summary: 'Get all options for a specific cost code',
    description:
      'Retrieve all options for a specific cost code, ordered by display order',
  })
  @ApiParam({
    name: 'costCodeId',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of options for cost code',
    type: [CostCodeOptionResponseDto],
    schema: {
      example: {
        message: 'Cost code options retrieved successfully',
        count: 3,
        data: [
          {
            id: 'option-id-1',
            optionName: 'Size',
            optionValue: 'Small',
            priceModifier: 0,
            finalPrice: 500,
            displayOrder: 0,
          },
        ],
      },
    },
  })
  findByCostCode(@Param('costCodeId') costCodeId: string) {
    return this.costCodeOptionsService.findByCostCode(costCodeId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get cost code option by ID',
    description:
      'Retrieve a specific cost code option by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code option unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code option found',
    type: CostCodeOptionResponseDto,
    schema: {
      example: {
        message: 'Cost code option retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          costCodeId: 'cost-code-id-123',
          optionName: 'Size',
          optionValue: 'Large',
          priceModifier: 150,
          finalPrice: 650,
          isDefault: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code option not found',
  })
  findOne(@Param('id') id: string) {
    return this.costCodeOptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update cost code option',
    description: 'Update an existing cost code option by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code option unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code option updated successfully',
    type: CostCodeOptionResponseDto,
    schema: {
      example: {
        message: 'Cost code option updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          optionName: 'Size',
          optionValue: 'Extra Large',
          priceModifier: 200,
          finalPrice: 700,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code option not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateCostCodeOptionDto: UpdateCostCodeOptionDto,
  ) {
    return this.costCodeOptionsService.update(id, updateCostCodeOptionDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({
    summary: 'Set this option as default for its cost code',
    description:
      'Set this option as the default option for its cost code (unsets other defaults)',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code option unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Option set as default successfully',
    type: CostCodeOptionResponseDto,
    schema: {
      example: {
        message: 'Option set as default successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          optionName: 'Size',
          optionValue: 'Medium',
          isDefault: true,
        },
      },
    },
  })
  setAsDefault(@Param('id') id: string) {
    return this.costCodeOptionsService.setAsDefault(id);
  }

  @Patch('cost-code/:costCodeId/reorder')
  @ApiOperation({
    summary: 'Reorder options for a cost code',
    description:
      'Reorder the display order of options for a specific cost code',
  })
  @ApiParam({
    name: 'costCodeId',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Options reordered successfully',
    schema: {
      example: {
        message: 'Cost code options retrieved successfully',
        count: 3,
        data: [
          {
            id: 'option-1',
            displayOrder: 0,
          },
          {
            id: 'option-2',
            displayOrder: 1,
          },
        ],
      },
    },
  })
  reorder(
    @Param('costCodeId') costCodeId: string,
    @Body() body: { optionIds: string[] },
  ) {
    return this.costCodeOptionsService.reorderOptions(
      costCodeId,
      body.optionIds,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete cost code option',
    description:
      'Permanently delete a cost code option. Cannot delete if used in submissions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code option unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code option deleted successfully',
    schema: {
      example: {
        message: 'Cost code option deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code option not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete option used in submissions',
  })
  remove(@Param('id') id: string) {
    return this.costCodeOptionsService.remove(id);
  }
}
