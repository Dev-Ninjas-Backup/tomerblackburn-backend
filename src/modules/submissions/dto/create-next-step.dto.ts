import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateNextStepDto {
  @ApiProperty({ example: 1, description: 'Step number (unique)' })
  @IsInt()
  @Min(1)
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
