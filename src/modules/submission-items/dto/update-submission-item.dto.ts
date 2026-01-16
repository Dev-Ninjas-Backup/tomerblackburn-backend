import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubmissionItemDto } from './create-submission-item.dto';
import { QuestionType } from 'generated/prisma/enums';

export class UpdateSubmissionItemDto extends PartialType(
  OmitType(CreateSubmissionItemDto, ['submissionId', 'costCodeId'] as const),
) {}

class CostCodeSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}

class CostCodeOptionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  optionName: string;

  @ApiProperty()
  priceModifier: number;
}

export class SubmissionItemResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Submission ID',
  })
  submissionId: string;

  @ApiProperty({
    description: 'Cost code ID',
  })
  costCodeId: string;

  @ApiProperty({
    description: 'Selected option ID',
    required: false,
  })
  selectedOptionId?: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price',
    example: 15.0,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Total price',
    example: 750.0,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Question type snapshot',
    enum: QuestionType,
    required: false,
  })
  questionType?: QuestionType;

  @ApiProperty({
    description: 'Whether toggle is enabled',
    example: true,
  })
  isEnabled: boolean;

  @ApiProperty({
    description: 'User input value',
    required: false,
  })
  userInputValue?: string;

  @ApiProperty({
    description: 'Snapshot of item name',
    required: false,
  })
  itemName?: string;

  @ApiProperty({
    description: 'Snapshot of item description',
    required: false,
  })
  itemDescription?: string;

  @ApiProperty({
    description: 'Snapshot of selected option name',
    required: false,
  })
  selectedOptionName?: string;

  @ApiProperty({
    description: 'Notes',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Cost code details',
    type: CostCodeSummaryDto,
    required: false,
  })
  costCode?: CostCodeSummaryDto;

  @ApiProperty({
    description: 'Selected option details',
    type: CostCodeOptionSummaryDto,
    required: false,
  })
  selectedOption?: CostCodeOptionSummaryDto;
}
