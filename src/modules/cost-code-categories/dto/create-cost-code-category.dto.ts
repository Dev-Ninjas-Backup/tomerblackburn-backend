import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCostCodeCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Demolition',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug (lowercase, hyphens only)',
    example: 'demolition',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only (e.g., "wall-ceiling")',
  })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Remove existing fixtures and prepare space',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'Step number in the estimator flow (1: Demolition & Structural, 2: Core Fixtures, 3: Finishing)',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  @IsOptional()
  stepNumber?: number;

  @ApiProperty({
    description: 'Display order within the step for sorting',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether this category is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
