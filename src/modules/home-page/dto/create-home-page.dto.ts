import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHomePageDto {
  @ApiProperty({
    description: 'Main hero title',
    example: 'Calculate Your Bathroom Remodeling Cost',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Hero subtitle',
    example:
      'From Minor Fixes to Full Renovations. We Treat Every Job With Care.',
  })
  @IsString()
  @IsNotEmpty()
  subTitle: string;

  @ApiProperty({
    description: 'Background image file ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  homeBackgroundImageId?: string;

  @ApiProperty({
    description: 'Our Mission section title',
    example: 'Our Mission',
  })
  @IsString()
  @IsNotEmpty()
  ourMissionTitle: string;

  @ApiProperty({
    description: 'Our Mission section content',
    example:
      'Construction companies are known for taking on too many projects at once...',
  })
  @IsString()
  @IsNotEmpty()
  ourMissionSubTitle: string;
}

export class CreateServiceStandsOutDto {
  @ApiProperty({
    description: 'Service title',
    example: 'RESPONSIVE COMMUNICATION',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Service description',
    example:
      "We follow up, follow through, and stay in touch, so you always know what's going on with your project.",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Service image file ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageId?: string;
}
