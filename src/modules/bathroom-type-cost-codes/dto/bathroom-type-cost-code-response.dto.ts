import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, UnitType } from 'generated/prisma/enums';

class BathroomTypeSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  basePrice: number;
}

class CategorySummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  stepNumber: number;

  @ApiProperty()
  displayOrder: number;
}

class CostCodeOptionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  optionName: string;

  @ApiProperty()
  priceModifier: number;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  displayOrder: number;
}

class CostCodeDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty({ enum: UnitType })
  unitType: UnitType;

  @ApiProperty({ enum: QuestionType })
  questionType: QuestionType;

  @ApiProperty()
  requiresQuantity: boolean;

  @ApiProperty()
  isOptional: boolean;

  @ApiProperty({ type: CategorySummaryDto })
  category: CategorySummaryDto;

  @ApiProperty({ type: [CostCodeOptionSummaryDto], required: false })
  options?: CostCodeOptionSummaryDto[];
}

export class BathroomTypeCostCodeResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Bathroom type ID',
  })
  bathroomTypeId: string;

  @ApiProperty({
    description: 'Cost code ID',
  })
  costCodeId: string;

  @ApiProperty({
    description: 'Whether included in base price for this bathroom type',
    example: false,
  })
  isIncludedInBase: boolean;

  @ApiProperty({
    description: 'Whether this is required for this bathroom type',
    example: false,
  })
  isRequired: boolean;

  @ApiProperty({
    description:
      'Whether this is visible in the estimator for this bathroom type',
    example: true,
  })
  isVisible: boolean;

  @ApiProperty({
    description: 'Default quantity for this bathroom type',
    example: 50.0,
    required: false,
  })
  defaultQuantity?: number;

  @ApiProperty({
    description: 'Price override for this bathroom type',
    example: 1500.0,
    required: false,
  })
  priceOverride?: number;

  @ApiProperty({
    description: 'Display order within category for this bathroom type',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Bathroom type details',
    type: BathroomTypeSummaryDto,
    required: false,
  })
  bathroomType?: BathroomTypeSummaryDto;

  @ApiProperty({
    description: 'Cost code details',
    type: CostCodeDetailDto,
    required: false,
  })
  costCode?: CostCodeDetailDto;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
