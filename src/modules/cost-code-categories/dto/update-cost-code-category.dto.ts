import { PartialType } from '@nestjs/swagger';
import { CreateCostCodeCategoryDto } from './create-cost-code-category.dto';

export class UpdateCostCodeCategoryDto extends PartialType(
  CreateCostCodeCategoryDto,
) {}

import { ApiProperty } from '@nestjs/swagger';

class CostCodeSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  colorTag: string;
}

export class CostCodeCategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Demolition',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'demolition',
  })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Remove existing fixtures and prepare space',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Related cost codes',
    type: [CostCodeSummaryDto],
    required: false,
  })
  costCodes?: CostCodeSummaryDto[];

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
