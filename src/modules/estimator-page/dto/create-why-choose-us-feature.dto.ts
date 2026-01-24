import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateWhyChooseUsFeatureDto {
  @ApiProperty({
    description: 'Feature title',
    example: 'Transparent Pricing',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Feature description',
    example: "See exactly what you're paying for with itemized estimates",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Icon file ID (must be a valid UUID from file_instances)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  iconId?: string;

  @ApiProperty({
    description: 'Display order (0-based)',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
