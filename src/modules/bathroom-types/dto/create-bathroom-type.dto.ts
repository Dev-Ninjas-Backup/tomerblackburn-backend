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

export class CreateBathroomTypeDto {
  @ApiProperty({
    description: 'Unique code for bathroom type',
    example: 'FP',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;

  @ApiProperty({
    description: 'Name of bathroom type',
    example: 'Four Piece',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Full description of what is included',
    example: 'Toilet + Sink + Shower + Tub',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullDescription?: string;

  @ApiProperty({
    description: 'Base price for this bathroom type',
    example: 15000.0,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  basePrice: number;

  @ApiProperty({
    description: 'File instance ID for bathroom image (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageFileId?: string;

  @ApiProperty({
    description:
      'Whether this bathroom type is active and visible to customers',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Display order for sorting (lower numbers appear first)',
    example: 1,
    default: 0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  displayOrder?: number;
}
