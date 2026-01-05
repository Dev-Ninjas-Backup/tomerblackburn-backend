import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCostCodeOptionDto {
  @ApiProperty({
    description: 'Cost code ID this option belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  costCodeId: string;

  @ApiProperty({
    description: 'Option name',
    example: 'Mid-Range',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  optionName: string;

  @ApiProperty({
    description: 'Option value (e.g., "24 inch", "Standard")',
    example: '24"',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  optionValue?: string;

  @ApiProperty({
    description: 'Price modifier (added to base price)',
    example: 500.0,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  priceModifier?: number;

  @ApiProperty({
    description: 'Whether this is the default option',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
