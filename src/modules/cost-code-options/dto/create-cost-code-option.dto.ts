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
    description: 'Base price (builder cost for this option)',
    example: 250.0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  basePrice?: number;

  @ApiProperty({
    description: 'Client price (retail price for this option)',
    example: 300.0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  clientPrice?: number;

  @ApiProperty({
    description:
      'Price modifier (added to base price, synced with clientPrice)',
    example: 300.0,
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
