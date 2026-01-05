import { PartialType } from '@nestjs/swagger';
import { CreateCostCodeCategoryDto } from './create-cost-code-category.dto';

export class UpdateCostCodeCategoryDto extends PartialType(CreateCostCodeCategoryDto) {}
