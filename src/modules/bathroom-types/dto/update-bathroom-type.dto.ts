import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class FileInstanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;
}

export class UpdateBathroomTypeDto {
  @ApiProperty({
    description: 'Unique code for bathroom type',
    example: 'FP',
    maxLength: 10,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  code?: string;

  @ApiProperty({
    description: 'Name of bathroom type',
    example: 'Four Piece',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

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
    example: 18000.0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  basePrice?: number;

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
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Display order for sorting (lower numbers appear first)',
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  displayOrder?: number;
}

export class BathroomTypeResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Bathroom type code',
    example: 'FP',
  })
  code: string;

  @ApiProperty({
    description: 'Bathroom type name',
    example: 'Four Piece',
  })
  name: string;

  @ApiProperty({
    description: 'Full description',
    example: 'Toilet + Sink + Shower + Tub',
    required: false,
  })
  fullDescription?: string;

  @ApiProperty({
    description: 'Base price',
    example: 15000.0,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Image file ID',
    required: false,
  })
  imageFileId?: string;

  @ApiProperty({
    description: 'Image file details',
    type: FileInstanceDto,
    required: false,
  })
  imageFile?: FileInstanceDto;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
