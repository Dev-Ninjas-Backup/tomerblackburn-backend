import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreatePrivacyPolicyDto {
  @ApiProperty({
    example: 'Privacy Policy',
    description: 'Title of the privacy policy',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '2026-01-30',
    description: 'Effective date of the privacy policy',
  })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({
    example: '1. Information We Collect\n\nAt BBurn Builders...',
    description: 'Body/description content of the privacy policy',
  })
  @IsString()
  body: string;
}
