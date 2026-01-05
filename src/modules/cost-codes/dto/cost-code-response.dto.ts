import { ApiProperty } from '@nestjs/swagger';

class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

class CostCodeOptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  optionName: string;

  @ApiProperty()
  optionValue: string;

  @ApiProperty()
  priceModifier: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  displayOrder: number;
}

export class CostCodeResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category ID',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Cost code',
    example: 'FP-D-1',
  })
  code: string;

  @ApiProperty({
    description: 'Cost code name',
    example: 'Demolition',
  })
  name: string;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Base price',
    example: 500.0,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Unit type',
    example: 'per_lot',
  })
  unitType?: string;

  @ApiProperty({
    description: 'Color tag',
    example: 'WHITE',
  })
  colorTag?: string;

  @ApiProperty({
    description: 'Calculation type',
    example: 'fixed',
  })
  calculationType?: string;

  @ApiProperty({
    description: 'Requires quantity',
    example: false,
  })
  requiresQuantity: boolean;

  @ApiProperty({
    description: 'Is optional',
    example: false,
  })
  isOptional: boolean;

  @ApiProperty({
    description: 'Is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Applies to Four Piece',
  })
  appliesToFp: boolean;

  @ApiProperty({
    description: 'Applies to Three Piece Shower',
  })
  appliesToTps: boolean;

  @ApiProperty({
    description: 'Applies to Three Piece Tub',
  })
  appliesToTpt: boolean;

  @ApiProperty({
    description: 'Applies to Two Piece',
  })
  appliesToTp: boolean;

  @ApiProperty({
    description: 'Category details',
    type: CategoryDto,
    required: false,
  })
  category?: CategoryDto;

  @ApiProperty({
    description: 'Cost code options',
    type: [CostCodeOptionDto],
    required: false,
  })
  options?: CostCodeOptionDto[];

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
