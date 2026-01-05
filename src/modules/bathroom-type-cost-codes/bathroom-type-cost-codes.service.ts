import { Injectable } from '@nestjs/common';
import { CreateBathroomTypeCostCodeDto } from './dto/create-bathroom-type-cost-code.dto';
import { UpdateBathroomTypeCostCodeDto } from './dto/update-bathroom-type-cost-code.dto';

@Injectable()
export class BathroomTypeCostCodesService {
  create(createBathroomTypeCostCodeDto: CreateBathroomTypeCostCodeDto) {
    return 'This action adds a new bathroomTypeCostCode';
  }

  findAll() {
    return `This action returns all bathroomTypeCostCodes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bathroomTypeCostCode`;
  }

  update(
    id: number,
    updateBathroomTypeCostCodeDto: UpdateBathroomTypeCostCodeDto,
  ) {
    return `This action updates a #${id} bathroomTypeCostCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} bathroomTypeCostCode`;
  }
}
