import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostCodeCategoriesService } from './cost-code-categories.service';
import { CreateCostCodeCategoryDto } from './dto/create-cost-code-category.dto';
import { UpdateCostCodeCategoryDto } from './dto/update-cost-code-category.dto';

@Controller('cost-code-categories')
export class CostCodeCategoriesController {
  constructor(private readonly costCodeCategoriesService: CostCodeCategoriesService) {}

  @Post()
  create(@Body() createCostCodeCategoryDto: CreateCostCodeCategoryDto) {
    return this.costCodeCategoriesService.create(createCostCodeCategoryDto);
  }

  @Get()
  findAll() {
    return this.costCodeCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCodeCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostCodeCategoryDto: UpdateCostCodeCategoryDto) {
    return this.costCodeCategoriesService.update(+id, updateCostCodeCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCodeCategoriesService.remove(+id);
  }
}
