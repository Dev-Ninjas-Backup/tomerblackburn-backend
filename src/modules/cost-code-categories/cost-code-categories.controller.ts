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
import { CostCodeCategoriesService } from './cost-code-categories.service';
import { CreateCostCodeCategoryDto } from './dto/create-cost-code-category.dto';
import {
  CostCodeCategoryResponseDto,
  UpdateCostCodeCategoryDto,
} from './dto/update-cost-code-category.dto';

@ApiTags('Cost Code Categories')
@Controller('cost-code-categories')
export class CostCodeCategoriesController {
  constructor(
    private readonly costCodeCategoriesService: CostCodeCategoriesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new cost code category',
    description: 'Create a new cost code category with unique slug',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cost code category created successfully',
    type: CostCodeCategoryResponseDto,
    schema: {
      example: {
        message: 'Cost code category created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'demolition',
          name: 'Demolition',
          description: 'Demolition and removal work',
          isActive: true,
          displayOrder: 1,
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
    description: 'Category with this slug already exists',
  })
  create(@Body() createCostCodeCategoryDto: CreateCostCodeCategoryDto) {
    return this.costCodeCategoriesService.create(createCostCodeCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cost code categories',
    description: 'Retrieve all cost code categories with optional filtering',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (true/false)',
    example: true,
  })
  @ApiQuery({
    name: 'includeCostCodes',
    required: false,
    type: Boolean,
    description: 'Include related cost codes in response',
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of cost code categories retrieved successfully',
    type: [CostCodeCategoryResponseDto],
    schema: {
      example: {
        message: 'Cost code categories retrieved successfully',
        count: 2,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            slug: 'demolition',
            name: 'Demolition',
            description: 'Demolition and removal work',
            isActive: true,
            displayOrder: 1,
          },
        ],
      },
    },
  })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('includeCostCodes') includeCostCodes?: string,
  ) {
    const activeFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    const includeRelations = includeCostCodes === 'true';
    return this.costCodeCategoriesService.findAll(
      activeFilter,
      includeRelations,
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active cost code categories' })
  @ApiQuery({
    name: 'includeCostCodes',
    required: false,
    type: Boolean,
    description: 'Include related cost codes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active cost code categories',
    type: [CostCodeCategoryResponseDto],
  })
  findActive(@Query('includeCostCodes') includeCostCodes?: string) {
    const includeRelations = includeCostCodes === 'true';
    return this.costCodeCategoriesService.findActive(includeRelations);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cost code category by ID' })
  @ApiParam({ name: 'id', description: 'Cost code category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code category found',
    type: CostCodeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code category not found',
  })
  findOne(@Param('id') id: string) {
    return this.costCodeCategoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get cost code category by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Cost code category slug',
    example: 'demolition',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code category found',
    type: CostCodeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code category not found',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.costCodeCategoriesService.findBySlug(slug);
  }

  @Patch('reorder')
  @ApiOperation({
    summary: 'Bulk reorder cost code categories by displayOrder',
  })
  reorder(@Body() body: { items: { id: string; displayOrder: number }[] }) {
    return this.costCodeCategoriesService.reorder(body.items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cost code category' })
  @ApiParam({ name: 'id', description: 'Cost code category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code category updated successfully',
    type: CostCodeCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this slug already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateCostCodeCategoryDto: UpdateCostCodeCategoryDto,
  ) {
    return this.costCodeCategoriesService.update(id, updateCostCodeCategoryDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle category active status' })
  @ApiParam({ name: 'id', description: 'Cost code category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category status toggled successfully',
    type: CostCodeCategoryResponseDto,
  })
  toggleStatus(@Param('id') id: string) {
    return this.costCodeCategoriesService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cost code category' })
  @ApiParam({ name: 'id', description: 'Cost code category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cost code category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cost code category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete category with existing cost codes',
  })
  remove(@Param('id') id: string) {
    return this.costCodeCategoriesService.remove(id);
  }
}
