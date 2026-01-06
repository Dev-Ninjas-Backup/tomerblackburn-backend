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
    description: 'Whether this cost code is included in base price',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInBase?: boolean;

  @ApiProperty({
    description: 'Whether this cost code is required',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description: 'Default quantity (for sqft or quantity inputs)',
    required: false,
    example: 50.0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  defaultQuantity?: number;
}
