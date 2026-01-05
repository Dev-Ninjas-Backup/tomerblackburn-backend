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
  unitType: string | null;

  @ApiProperty()
  colorTag: string | null;

  @ApiProperty()
  calculationType: string | null;

  @ApiProperty()
  requiresQuantity: boolean;

  @ApiProperty()
  isOptional: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  appliesToFp: boolean;

  @ApiProperty()
  appliesToTps: boolean;

  @ApiProperty()
  appliesToTpt: boolean;

  @ApiProperty()
  appliesToTp: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
