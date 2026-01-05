import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

enum ColorTag {
  WHITE = 'WHITE',
  ORANGE = 'ORANGE',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
}

enum CalculationType {
  FIXED = 'fixed',
  USER_INPUT = 'user_input',
  SELECTION = 'selection',
  TOGGLE = 'toggle',
}

enum UnitType {
  PER_LOT = 'per_lot',
  PER_SQFT = 'per_sqft',
  PER_UPGRADE = 'per_upgrade',
  PER_EACH = 'per_each',
  PER_SET = 'per_set',
  FIXED = 'fixed',
}

export class CreateCostCodeDto {
  @ApiProperty({
    description: 'Category ID this cost code belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Unique cost code',
    example: 'FP-D-1',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    description: 'Cost code name',
    example: 'Demolition',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Cost code description',
    example: 'Remove existing fixtures, tile, and prepare space for remodel',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Base price for this cost code',
    example: 500.0,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiProperty({
    description: 'Unit type for pricing',
    enum: UnitType,
    example: 'per_lot',
    required: false,
  })
  @IsEnum(UnitType)
  @IsOptional()
  unitType?: string;

  @ApiProperty({
    description: 'Color tag for UI categorization',
    enum: ColorTag,
    example: 'WHITE',
    required: false,
  })
  @IsEnum(ColorTag)
  @IsOptional()
  colorTag?: string;

  @ApiProperty({
    description: 'Calculation type for this cost code',
    enum: CalculationType,
    example: 'fixed',
    required: false,
  })
  @IsEnum(CalculationType)
  @IsOptional()
  calculationType?: string;

  @ApiProperty({
    description: 'Whether this cost code requires quantity input',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresQuantity?: boolean;

  @ApiProperty({
    description: 'Whether this cost code is optional',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @ApiProperty({
    description: 'Whether this cost code is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Applies to Four Piece bathroom',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  appliesToFp?: boolean;

  @ApiProperty({
    description: 'Applies to Three Piece Shower bathroom',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  appliesToTps?: boolean;

  @ApiProperty({
    description: 'Applies to Three Piece Tub bathroom',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  appliesToTpt?: boolean;

  @ApiProperty({
    description: 'Applies to Two Piece bathroom',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  appliesToTp?: boolean;
}
