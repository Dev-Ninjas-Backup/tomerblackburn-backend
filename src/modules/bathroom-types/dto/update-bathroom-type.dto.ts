import { PartialType } from '@nestjs/swagger';
import { CreateBathroomTypeDto } from './create-bathroom-type.dto';

export class UpdateBathroomTypeDto extends PartialType(CreateBathroomTypeDto) {}
