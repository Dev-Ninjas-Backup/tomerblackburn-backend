import { ApiProperty } from '@nestjs/swagger';
import { BathroomType } from 'generated/prisma/client';

export class BathroomTypeEntity implements BathroomType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortDescription: string | null;

  @ApiProperty()
  fullDescription: string | null;

  @ApiProperty()
  basePrice: any;

  @ApiProperty()
  imageFileId: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
