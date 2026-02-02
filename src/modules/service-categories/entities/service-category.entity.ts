import { ApiProperty } from '@nestjs/swagger';

export class ServiceCategoryEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project type ID (foreign key)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectTypeId: string;

  @ApiProperty({
    description: 'Service category name',
    example: 'Bathroom Type',
  })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service category',
    example: 'Different types of bathroom configurations',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 0,
    default: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this service category is active',
    example: true,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
