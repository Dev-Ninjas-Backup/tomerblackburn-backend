import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import {
  CreatePortfolioCategoryDto,
  CreatePortfolioImageDto,
} from './create-portfolio.dto';

export class UpdatePortfolioCategoryDto extends PartialType(
  OmitType(CreatePortfolioCategoryDto, ['images'] as const),
) {}

export class UpdatePortfolioImageDto extends PartialType(
  CreatePortfolioImageDto,
) {}

class FileInstanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;
}

class PortfolioImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  fileId: string;

  @ApiProperty({ required: false })
  caption?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty({ type: FileInstanceDto, required: false })
  file?: FileInstanceDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PortfolioCategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Lakeview',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'lakeview',
  })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Category images',
    type: [PortfolioImageResponseDto],
    required: false,
  })
  images?: PortfolioImageResponseDto[];

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
