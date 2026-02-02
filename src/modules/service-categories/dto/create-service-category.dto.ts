import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'Project type ID (foreign key)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  projectTypeId: string;

  @ApiProperty({
    description: 'Service category name',
    example: 'Bathroom Type',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service category',
    example: 'Different types of bathroom configurations',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 0,
    default: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether this service category is active',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
