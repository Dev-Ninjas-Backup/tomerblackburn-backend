import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkAssignCostCodesDto {
  @ApiProperty({
    description: 'Bathroom type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  bathroomTypeId: string;

  @ApiProperty({
    description: 'Array of cost code IDs to assign',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  costCodeIds: string[];

  @ApiProperty({
    description: 'Whether these cost codes are included in base price',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInBase?: boolean;

  @ApiProperty({
    description: 'Whether these cost codes are required',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description: 'Whether these cost codes are visible in the estimator',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({
    description: 'Price override for all assigned cost codes',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  priceOverride?: number;
}
