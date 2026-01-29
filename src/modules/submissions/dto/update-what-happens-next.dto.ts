import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class NextStepItemDto {
  @ApiProperty({ example: 1, description: 'Step number' })
  @IsInt()
  @Min(0)
  stepNumber: number;

  @ApiProperty({
    example: "You'll receive an email confirmation",
    description: 'Step title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Check your inbox for a summary of your estimate',
    description: 'Step description',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: true, description: 'Is step active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Display order' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateWhatHappensNextDto {
  @ApiPropertyOptional({
    example: 'What happens next?',
    description: 'Title for the section (informational only)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    type: [NextStepItemDto],
    description: 'Array of next steps',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NextStepItemDto)
  steps: NextStepItemDto[];
}
