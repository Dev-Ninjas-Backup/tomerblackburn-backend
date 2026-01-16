import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBathroomTypeCostCodeDto {
  @ApiProperty({
    description: 'Bathroom type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  bathroomTypeId: string;

  @ApiProperty({
    description: 'Cost code ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  costCodeId: string;

  @ApiProperty({
    description:
      'Whether this cost code is included in base price for this bathroom type',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInBase?: boolean;

  @ApiProperty({
    description: 'Whether this cost code is required for this bathroom type',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description:
      'Whether this cost code is visible in the estimator for this bathroom type',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({
    description:
      'Default quantity for this bathroom type (for sqft or quantity inputs)',
    required: false,
    example: 50.0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  defaultQuantity?: number;

  @ApiProperty({
    description:
      'Price override for this bathroom type (overrides cost code base price)',
    required: false,
    example: 1500.0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  priceOverride?: number;

  @ApiProperty({
    description: 'Display order within category for this bathroom type',
    default: 0,
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
