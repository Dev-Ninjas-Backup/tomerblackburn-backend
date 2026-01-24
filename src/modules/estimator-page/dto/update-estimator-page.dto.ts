import { PartialType } from '@nestjs/swagger';
import { CreateEstimatorPageDto } from './create-estimator-page.dto';

export class UpdateEstimatorPageDto extends PartialType(
  CreateEstimatorPageDto,
) {}
