import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCostCodeOptionDto } from './create-cost-code-option.dto';
import { OmitType } from '@nestjs/swagger';

class OptionDataDto extends OmitType(CreateCostCodeOptionDto, [
  'costCodeId',
] as const) {}

export class BulkCreateCostCodeOptionsDto {
  @ApiProperty({
    description: 'Cost code ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  costCodeId: string;

  @ApiProperty({
    description: 'Array of options to create',
    type: [OptionDataDto],
    example: [
      {
        optionName: 'Standard',
        optionValue: 'Standard',
        priceModifier: 0,
        isDefault: true,
        displayOrder: 0,
      },
      {
        optionName: 'Mid-Range',
        optionValue: 'Mid-Range',
        priceModifier: 500,
        isDefault: false,
        displayOrder: 1,
      },
      {
        optionName: 'Premium',
        optionValue: 'Premium',
        priceModifier: 1200,
        isDefault: false,
        displayOrder: 2,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OptionDataDto)
  options: OptionDataDto[];
}
