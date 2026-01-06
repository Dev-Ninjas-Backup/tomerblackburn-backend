import { ApiProperty } from '@nestjs/swagger';

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
  finalPrice: number;

  @ApiProperty()
  isDefault: boolean;
}

class CostCodeDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  unitType: string;

  @ApiProperty()
  colorTag: string;

  @ApiProperty()
  calculationType: string;

  @ApiProperty()
  requiresQuantity: boolean;

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
    description: 'Whether included in base price',
    example: true,
  })
  isIncludedInBase: boolean;

  @ApiProperty({
    description: 'Whether this is required',
    example: false,
  })
  isRequired: boolean;

  @ApiProperty({
    description: 'Default quantity',
    example: 50.0,
    required: false,
  })
  defaultQuantity?: number;

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
}
