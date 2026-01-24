import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateHowItWorksStepDto {
  @ApiProperty({
    description: 'Step number (1-3)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  stepNumber: number;

  @ApiProperty({
    description: 'Step title',
    example: 'Select Type',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Step description',
    example: 'Choose your bathroom type',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
