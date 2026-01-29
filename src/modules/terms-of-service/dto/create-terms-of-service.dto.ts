import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreateTermsOfServiceDto {
  @ApiProperty({
    example: 'Terms of Service',
    description: 'Title of the terms of service',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '2026-01-30',
    description: 'Effective date of the terms of service',
  })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({
    example: '1. Acceptance of Terms\n\nBy accessing...',
    description: 'Body/description content of the terms of service',
  })
  @IsString()
  body: string;
}
