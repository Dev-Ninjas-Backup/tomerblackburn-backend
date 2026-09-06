import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSeoPageDto {
  @ApiPropertyOptional({ example: 'Home Page' })
  @IsString()
  @IsOptional()
  pageName?: string;

  @ApiPropertyOptional({
    example: 'BBurn Builders — Premier Custom Remodeling in Chicago',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example:
      "Transform your home with Chicago's premier remodeling contractor.",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'home remodeling, bathroom remodel chicago' })
  @IsString()
  @IsOptional()
  keywords?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ogTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ogDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  noIndex?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  noFollow?: boolean;

  @ApiPropertyOptional({ example: 0.9 })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ example: 'weekly' })
  @IsString()
  @IsOptional()
  changeFreq?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  structuredDataJson?: string;
}
