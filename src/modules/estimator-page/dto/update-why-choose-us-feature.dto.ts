import { PartialType } from '@nestjs/swagger';
import { CreateWhyChooseUsFeatureDto } from './create-why-choose-us-feature.dto';

export class UpdateWhyChooseUsFeatureDto extends PartialType(
  CreateWhyChooseUsFeatureDto,
) {}
