import { PartialType } from '@nestjs/swagger';
import { CreatePrivacyPolicyDto } from './create-privacy-policy.dto';

export class UpdatePrivacyPolicyDto extends PartialType(
  CreatePrivacyPolicyDto,
) {}
