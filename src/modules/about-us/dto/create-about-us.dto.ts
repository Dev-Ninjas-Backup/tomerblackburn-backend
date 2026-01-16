import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAboutUsDto {
  @ApiProperty({
    description: 'Page title',
    example: 'Our Philosophy',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Owner info/subtitle',
    example: 'From Tomer Blackburn, BBurn Builders founder & owner',
  })
  @IsString()
  @IsNotEmpty()
  ownerInfo: string;

  @ApiProperty({
    description: 'About us description/content',
    example:
      'I started BBurn Builders to bring the focus of the construction industry back where it belongs: on client communication and satisfaction.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Owner/Team image file ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageId?: string;
}
