import { ApiProperty } from '@nestjs/swagger';
import { CostCodeCategory } from 'generated/prisma/client';

export class CostCodeCategoryEntity implements CostCodeCategory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
