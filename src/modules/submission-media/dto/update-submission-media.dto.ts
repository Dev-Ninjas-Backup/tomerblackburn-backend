import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubmissionMediaDto } from './create-submission-media.dto';
import { MediaType } from 'generated/prisma/enums';

export class UpdateSubmissionMediaDto extends PartialType(
  OmitType(CreateSubmissionMediaDto, [
    'submissionId',
    'fileInstanceId',
  ] as const),
) {}

class FileInstanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalFilename: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;
}

export class SubmissionMediaResponseDto {
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
    description: 'File instance ID',
  })
  fileInstanceId: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.PHOTO,
  })
  mediaType: MediaType;

  @ApiProperty({
    description: 'Description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Upload timestamp',
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'File instance details',
    type: FileInstanceDto,
    required: false,
  })
  fileInstance?: FileInstanceDto;
}
