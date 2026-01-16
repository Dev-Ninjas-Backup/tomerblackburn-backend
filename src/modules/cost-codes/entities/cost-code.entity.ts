import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client-runtime-utils';
import { CostCode } from 'generated/prisma/client';

export class CostCodeEntity implements CostCode {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  basePrice: Decimal;

  @ApiProperty()
  unitType: CostCode['unitType'];

  @ApiProperty()
  questionType: CostCode['questionType'];

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isIncludedInBase: boolean;

  @ApiProperty()
  requiresQuantity: boolean;

  @ApiProperty()
  isOptional: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
