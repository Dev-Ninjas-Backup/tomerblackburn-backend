import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEstimatorPageDto {
  @ApiProperty({
    description: 'Hero section title',
    example: 'Estimate Your Bathroom Remodel Cost',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Hero section description',
    example:
      'Professional bathroom remodels - real quotes, competitive pricing, 15 verified steps',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'Background image file ID (must be a valid UUID from file_instances)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  backgroundImageId?: string;

  @ApiProperty({
    description: 'How It Works section title',
    example: 'How It Works',
    default: 'How It Works',
  })
  @IsString()
  @IsOptional()
  howItWorksTitle?: string;

  @ApiProperty({
    description: 'Why Choose Us section title',
    example: 'Why Choose Us',
    default: 'Why Choose Us',
  })
  @IsString()
  @IsOptional()
  whyChooseUsTitle?: string;
}
