import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CostCodeFilterDto {
  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by color tag',
    required: false,
    enum: ['WHITE', 'ORANGE', 'BLUE', 'YELLOW', 'GREEN'],
  })
  @IsString()
  @IsOptional()
  colorTag?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter by calculation type',
    required: false,
    enum: ['fixed', 'user_input', 'selection', 'toggle'],
  })
  @IsString()
  @IsOptional()
  calculationType?: string;

  @ApiProperty({
    description: 'Include cost code options',
    required: false,
    default: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeOptions?: boolean = true;

  @ApiProperty({
    description: 'Include category details',
    required: false,
    default: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeCategory?: boolean = true;
}
