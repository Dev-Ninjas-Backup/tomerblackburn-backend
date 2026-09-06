import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSeoSettingsDto {
  @ApiPropertyOptional({ example: 'BBurn Builders' })
  @IsString()
  @IsOptional()
  siteName?: string;

  @ApiPropertyOptional({ example: '%s | BBurn Builders' })
  @IsString()
  @IsOptional()
  titleTemplate?: string;

  @ApiPropertyOptional({
    example: 'BBurn Builders — Premier Custom Remodeling | Chicago, IL',
  })
  @IsString()
  @IsOptional()
  defaultTitle?: string;

  @ApiPropertyOptional({
    example:
      "Chicago's premier residential remodeling and construction company.",
  })
  @IsString()
  @IsOptional()
  defaultDescription?: string;

  @ApiPropertyOptional({
    example: 'home remodeling chicago, bathroom remodel chicago',
  })
  @IsString()
  @IsOptional()
  defaultKeywords?: string;

  @ApiPropertyOptional({ example: 'https://bburnbuilders.com' })
  @IsString()
  @IsOptional()
  siteUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ogImageUrl?: string;

  @ApiPropertyOptional({ example: '@bburnbuilders' })
  @IsString()
  @IsOptional()
  twitterHandle?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  robotsIndex?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  robotsFollow?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleSiteVerification?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bingSiteVerification?: string;

  @ApiPropertyOptional({ example: 'G-XXXXXXXXXX' })
  @IsString()
  @IsOptional()
  googleAnalyticsId?: string;

  @ApiPropertyOptional({ example: 'GTM-XXXXXXX' })
  @IsString()
  @IsOptional()
  googleTagManagerId?: string;

  @ApiPropertyOptional({ example: 'https://bburnbuilders.com' })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  // Schema.org Fields
  @ApiPropertyOptional({ example: 'GeneralContractor' })
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiPropertyOptional({ example: '773-403-9950' })
  @IsString()
  @IsOptional()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'estimates@bburnbuilders.com' })
  @IsString()
  @IsOptional()
  businessEmail?: string;

  @ApiPropertyOptional({ example: 'Chicago, IL' })
  @IsString()
  @IsOptional()
  businessStreetAddress?: string;

  @ApiPropertyOptional({ example: 'Chicago' })
  @IsString()
  @IsOptional()
  businessCity?: string;

  @ApiPropertyOptional({ example: 'IL' })
  @IsString()
  @IsOptional()
  businessState?: string;

  @ApiPropertyOptional({ example: '60601' })
  @IsString()
  @IsOptional()
  businessPostalCode?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString()
  @IsOptional()
  businessCountry?: string;

  @ApiPropertyOptional({ example: '$$$' })
  @IsString()
  @IsOptional()
  priceRange?: string;

  @ApiPropertyOptional({ example: 'Mo-Sa 08:00-18:00' })
  @IsString()
  @IsOptional()
  openingHours?: string;

  @ApiPropertyOptional({ example: 41.8781 })
  @IsNumber()
  @IsOptional()
  geoLatitude?: number;

  @ApiPropertyOptional({ example: -87.6298 })
  @IsNumber()
  @IsOptional()
  geoLongitude?: number;

  @ApiPropertyOptional({ example: 'Chicago, Naperville, Evanston, Oak Park' })
  @IsString()
  @IsOptional()
  serviceAreas?: string;
}
