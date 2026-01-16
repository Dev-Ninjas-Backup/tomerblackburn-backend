import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBathroomTypeDto } from './create-bathroom-type.dto';

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

export class UpdateBathroomTypeDto extends PartialType(CreateBathroomTypeDto) {}

export class BathroomTypeResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Bathroom type code',
    example: 'FP',
  })
  code: string;

  @ApiProperty({
    description: 'Bathroom type name',
    example: 'Four Piece',
  })
  name: string;

  @ApiProperty({
    description: 'Short description displayed on cards',
    example: 'Toilet + Sink + Shower + Tub',
    required: false,
  })
  shortDescription?: string;

  @ApiProperty({
    description: 'Full detailed description',
    example:
      'Complete bathroom renovation including toilet, sink/vanity, shower, and bathtub installation.',
    required: false,
  })
  fullDescription?: string;

  @ApiProperty({
    description: 'Base price',
    example: 15000.0,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Image file ID',
    required: false,
  })
  imageFileId?: string;

  @ApiProperty({
    description: 'Image file details',
    type: FileInstanceDto,
    required: false,
  })
  imageFile?: FileInstanceDto;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
