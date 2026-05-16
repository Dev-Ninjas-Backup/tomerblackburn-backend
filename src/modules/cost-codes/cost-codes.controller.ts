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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CostCodesService } from './cost-codes.service';
import { CreateCostCodeDto } from './dto/create-cost-code.dto';
import { UpdateCostCodeDto } from './dto/update-cost-code.dto';
import { CostCodeResponseDto } from './dto/cost-code-response.dto';
import { CostCodeFilterDto } from './dto/cost-code-filter.dto';

@ApiTags('Cost Codes')
@Controller('cost-codes')
export class CostCodesController {
  constructor(private readonly costCodesService: CostCodesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new cost code',
    description: 'Create a new cost code with unique code identifier',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code created successfully',
    type: CostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'FP-D-1',
          name: 'Floor Tile Installation',
          categoryId: 'cat-id-123',
          questionType: 'WHITE',
          unitType: 'FIXED',
          isActive: true,
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
    description: 'Cost code with this code already exists',
  })
  create(@Body() createCostCodeDto: CreateCostCodeDto) {
    return this.costCodesService.create(createCostCodeDto);
  }

  @Get('export/buildertrend')
  @ApiOperation({
    summary: 'Export cost codes for Buildertrend import (Excel)',
  })
  async exportForBuildertrend(@Res() res: Response) {
    const { buffer, filename } =
      await this.costCodesService.exportForBuildertrend();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cost codes with filters',
    description:
      'Retrieve all cost codes with optional filtering by category, question type, unit type, and status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost codes retrieved successfully',
    type: [CostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes retrieved successfully',
        count: 5,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'FP-D-1',
            name: 'Floor Tile Installation',
            questionType: 'WHITE',
            unitType: 'FIXED',
            isActive: true,
          },
        ],
      },
    },
  })
  findAll(@Query() filterDto: CostCodeFilterDto) {
    return this.costCodesService.findAll(filterDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get cost codes by category',
    description: 'Retrieve all active cost codes for a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The unique identifier of the cost code category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost codes in category',
    type: [CostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes retrieved successfully',
        count: 3,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'FP-D-1',
            name: 'Floor Tile Installation',
            categoryId: 'cat-id-123',
            isActive: true,
          },
        ],
      },
    },
  })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.costCodesService.findByCategory(categoryId);
  }

  @Get('bathroom-type/:bathroomTypeId')
  @ApiOperation({
    summary: 'Get cost codes for bathroom type',
    description:
      'Retrieve all active cost codes applicable to a specific bathroom type via junction table',
  })
  @ApiParam({
    name: 'bathroomTypeId',
    description: 'Bathroom type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeOptions',
    required: false,
    type: Boolean,
    description: 'Include cost code options',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of applicable cost codes with overrides',
    type: [CostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes for bathroom type retrieved successfully',
        count: 10,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'FP-D-1',
            name: 'Floor Tile Installation',
            isIncludedInBase: true,
            priceOverride: 500,
            isActive: true,
          },
        ],
      },
    },
  })
  findByBathroomType(
    @Param('bathroomTypeId') bathroomTypeId: string,
    @Query('includeOptions') includeOptions?: string,
  ) {
    const includeOpts = includeOptions !== 'false';
    return this.costCodesService.findByBathroomType(
      bathroomTypeId,
      includeOpts,
    );
  }

  @Get('question-type/:questionType')
  @ApiOperation({
    summary: 'Get cost codes by question type',
    description:
      'Retrieve all active cost codes with a specific question type (WHITE, BLUE, GREEN, ORANGE, YELLOW, RED, PURPLE)',
  })
  @ApiParam({
    name: 'questionType',
    description:
      'Question type (WHITE, BLUE, GREEN, ORANGE, YELLOW, RED, PURPLE)',
    example: 'WHITE',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost codes with specified question type',
    type: [CostCodeResponseDto],
    schema: {
      example: {
        message: 'Cost codes with WHITE question type retrieved successfully',
        count: 5,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'FP-D-1',
            name: 'Floor Tile Installation',
            questionType: 'WHITE',
            isActive: true,
          },
        ],
      },
    },
  })
  findByQuestionType(@Param('questionType') questionType: string) {
    return this.costCodesService.findByQuestionType(questionType.toUpperCase());
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get cost code by ID',
    description: 'Retrieve a specific cost code by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code found',
    type: CostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'FP-D-1',
          name: 'Floor Tile Installation',
          categoryId: 'cat-id-123',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code not found',
  })
  findOne(@Param('id') id: string) {
    return this.costCodesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get cost code by code',
    description: 'Retrieve a specific cost code by its unique code identifier',
  })
  @ApiParam({
    name: 'code',
    description: 'Cost code identifier (e.g., FP-D-1)',
    example: 'FP-D-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code found',
    type: CostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'FP-D-1',
          name: 'Floor Tile Installation',
          categoryId: 'cat-id-123',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code not found',
  })
  findByCode(@Param('code') code: string) {
    return this.costCodesService.findByCode(code);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk reorder cost codes by displayOrder' })
  reorder(@Body() body: { items: { id: string; displayOrder: number }[] }) {
    return this.costCodesService.reorder(body.items);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update cost code',
    description: 'Update an existing cost code by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code updated successfully',
    type: CostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'FP-D-1',
          name: 'Updated Floor Tile Installation',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateCostCodeDto: UpdateCostCodeDto,
  ) {
    return this.costCodesService.update(id, updateCostCodeDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle cost code active status',
    description:
      'Toggle the isActive status of a cost code between true and false',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code status toggled successfully',
    type: CostCodeResponseDto,
    schema: {
      example: {
        message: 'Cost code status toggled successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'FP-D-1',
          name: 'Floor Tile Installation',
          isActive: false,
        },
      },
    },
  })
  toggleStatus(@Param('id') id: string) {
    return this.costCodesService.toggleStatus(id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add image to cost code' })
  addImage(@Param('id') id: string, @Body() body: { fileInstanceId: string }) {
    return this.costCodesService.addImage(id, body.fileInstanceId);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Remove image from cost code' })
  removeImage(@Param('imageId') imageId: string) {
    return this.costCodesService.removeImage(imageId);
  }

  @Patch(':id/images/reorder')
  @ApiOperation({ summary: 'Reorder cost code images' })
  reorderImages(
    @Body() body: { items: { id: string; displayOrder: number }[] },
  ) {
    return this.costCodesService.reorderImages(body.items);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete cost code',
    description:
      'Permanently delete a cost code. Cannot delete if there are existing submission items.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cost code unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code deleted successfully',
    schema: {
      example: {
        message: 'Cost code deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete cost code with existing submissions',
  })
  remove(@Param('id') id: string) {
    return this.costCodesService.remove(id);
  }
}
