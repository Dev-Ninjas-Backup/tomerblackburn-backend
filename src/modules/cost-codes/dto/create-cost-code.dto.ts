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
import { QuestionType, UnitType } from 'generated/prisma/enums';

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
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Cost code name/title',
    example: 'Floor Tile Installation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the work',
    example: 'Installation of floor tiles including mortar, grout, and labor',
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
    description: 'Unit type for pricing calculation',
    enum: UnitType,
    enumName: 'UnitType',
    example: UnitType.FIXED,
    default: UnitType.FIXED,
  })
  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @ApiProperty({
    description: 'Question type determines UI behavior (color-coded in admin)',
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.WHITE,
    default: QuestionType.WHITE,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({
    description: 'Display order within category',
    example: 1,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether this cost is included in the base price',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isIncludedInBase?: boolean;

  @ApiProperty({
    description: 'Whether this cost code requires quantity input',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresQuantity?: boolean;

  @ApiProperty({
    description: 'Whether this cost code is optional (can be toggled on/off)',
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
}
