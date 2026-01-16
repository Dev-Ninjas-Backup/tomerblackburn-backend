import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from 'generated/prisma/enums';

export class CreateSubmissionItemDto {
  @ApiProperty({
    description: 'Submission ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @ApiProperty({
    description: 'Cost code ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  costCodeId: string;

  @ApiProperty({
    description: 'Selected option ID (for dropdown/tier selections)',
    required: false,
  })
  @IsString()
  @IsOptional()
  selectedOptionId?: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Unit price',
    example: 15.0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Total price (quantity * unitPrice)',
    example: 750.0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalPrice: number;

  @ApiProperty({
    description: 'Question type snapshot at submission time',
    enum: QuestionType,
    required: false,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({
    description: 'Whether this toggle item is enabled',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'User input value (for user input items like sqft)',
    example: '150',
    required: false,
  })
  @IsString()
  @IsOptional()
  userInputValue?: string;

  @ApiProperty({
    description: 'Snapshot of cost code name at submission time',
    required: false,
  })
  @IsString()
  @IsOptional()
  itemName?: string;

  @ApiProperty({
    description: 'Snapshot of cost code description at submission time',
    required: false,
  })
  @IsString()
  @IsOptional()
  itemDescription?: string;

  @ApiProperty({
    description: 'Snapshot of selected option name at submission time',
    required: false,
  })
  @IsString()
  @IsOptional()
  selectedOptionName?: string;

  @ApiProperty({
    description: 'Notes for this item',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
