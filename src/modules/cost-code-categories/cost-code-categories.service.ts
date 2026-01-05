import { Injectable } from '@nestjs/common';
import { CreateCostCodeCategoryDto } from './dto/create-cost-code-category.dto';
import { UpdateCostCodeCategoryDto } from './dto/update-cost-code-category.dto';

@Injectable()
export class CostCodeCategoriesService {
  create(createCostCodeCategoryDto: CreateCostCodeCategoryDto) {
    return 'This action adds a new costCodeCategory';
  }

  findAll() {
    return `This action returns all costCodeCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costCodeCategory`;
  }

  update(id: number, updateCostCodeCategoryDto: UpdateCostCodeCategoryDto) {
    return `This action updates a #${id} costCodeCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} costCodeCategory`;
  }
}
