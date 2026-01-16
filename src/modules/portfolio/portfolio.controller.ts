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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import {
  CreatePortfolioCategoryDto,
  CreatePortfolioImageDto,
} from './dto/create-portfolio.dto';
import {
  UpdatePortfolioCategoryDto,
  UpdatePortfolioImageDto,
  PortfolioCategoryResponseDto,
} from './dto/update-portfolio.dto';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // Category endpoints
  @Post('categories')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create portfolio category',
    description: 'Create a new portfolio category with optional images',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: PortfolioCategoryResponseDto,
  })
  createCategory(@Body() createDto: CreatePortfolioCategoryDto) {
    return this.portfolioService.createCategory(createDto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all portfolio categories',
    description: 'Retrieve all portfolio categories with images',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: [PortfolioCategoryResponseDto],
  })
  findAllCategories(@Query('includeInactive') includeInactive?: string) {
    return this.portfolioService.findAllCategories(includeInactive === 'true');
  }

  @Get('categories/:id')
  @ApiOperation({
    summary: 'Get portfolio category by ID',
    description: 'Retrieve a specific portfolio category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: PortfolioCategoryResponseDto,
  })
  findCategoryById(@Param('id') id: string) {
    return this.portfolioService.findCategoryById(id);
  }

  @Get('categories/slug/:slug')
  @ApiOperation({
    summary: 'Get portfolio category by slug',
    description: 'Retrieve a portfolio category by its slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: PortfolioCategoryResponseDto,
  })
  findCategoryBySlug(@Param('slug') slug: string) {
    return this.portfolioService.findCategoryBySlug(slug);
  }

  @Patch('categories/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update portfolio category',
    description: 'Update an existing portfolio category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: PortfolioCategoryResponseDto,
  })
  updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdatePortfolioCategoryDto,
  ) {
    return this.portfolioService.updateCategory(id, updateDto);
  }

  @Patch('categories/:id/toggle-status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle category status',
    description: 'Toggle category between active and inactive',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category status toggled successfully',
  })
  toggleCategoryStatus(@Param('id') id: string) {
    return this.portfolioService.toggleCategoryStatus(id);
  }

  @Delete('categories/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete portfolio category',
    description: 'Delete a portfolio category and all its images',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  removeCategory(@Param('id') id: string) {
    return this.portfolioService.removeCategory(id);
  }

  // Image endpoints
  @Post('categories/:categoryId/images')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add image to category',
    description: 'Add a new image to a portfolio category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image added successfully',
  })
  addImage(
    @Param('categoryId') categoryId: string,
    @Body() createDto: CreatePortfolioImageDto,
  ) {
    return this.portfolioService.addImage(categoryId, createDto);
  }

  @Patch('images/:imageId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update portfolio image',
    description: 'Update an existing portfolio image',
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image updated successfully',
  })
  updateImage(
    @Param('imageId') imageId: string,
    @Body() updateDto: UpdatePortfolioImageDto,
  ) {
    return this.portfolioService.updateImage(imageId, updateDto);
  }

  @Delete('images/:imageId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete portfolio image',
    description: 'Delete a portfolio image',
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image deleted successfully',
  })
  removeImage(@Param('imageId') imageId: string) {
    return this.portfolioService.removeImage(imageId);
  }

  @Post('categories/:categoryId/reorder-images')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reorder category images',
    description: 'Reorder images within a category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Images reordered successfully',
  })
  reorderImages(
    @Param('categoryId') categoryId: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.portfolioService.reorderImages(categoryId, body.imageIds);
  }
}
