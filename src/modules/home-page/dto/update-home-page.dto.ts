import { PartialType } from '@nestjs/swagger';
import {
  CreateHomePageDto,
  CreateServiceStandsOutDto,
} from './create-home-page.dto';

export class UpdateHomePageDto extends PartialType(CreateHomePageDto) {}

export class UpdateServiceStandsOutDto extends PartialType(
  CreateServiceStandsOutDto,
) {}
