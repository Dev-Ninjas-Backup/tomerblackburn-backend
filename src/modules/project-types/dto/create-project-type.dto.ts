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

export class CreateProjectTypeDto {
  @ApiProperty({
    description: 'Project type name',
    example: 'Bathroom Renovation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the project type',
    example:
      'Complete bathroom renovation services including design and installation',
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
    description: 'Whether this project type is active',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
