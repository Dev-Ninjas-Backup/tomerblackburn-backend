import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client-runtime-utils';
import { CostCodeOption } from 'generated/prisma/client';

export class CostCodeOptionEntity implements CostCodeOption {
  @ApiProperty()
  id: string;

  @ApiProperty()
  costCodeId: string;

  @ApiProperty()
  optionName: string;

  @ApiProperty()
  optionValue: string | null;

  @ApiProperty()
  basePrice: Decimal;

  @ApiProperty()
  clientPrice: Decimal;

  @ApiProperty()
  priceModifier: Decimal;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
