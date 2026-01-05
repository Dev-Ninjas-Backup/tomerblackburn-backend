import { Injectable } from '@nestjs/common';
import { CreateCostCodeDto } from './dto/create-cost-code.dto';
import { UpdateCostCodeDto } from './dto/update-cost-code.dto';

@Injectable()
export class CostCodesService {
  create(createCostCodeDto: CreateCostCodeDto) {
    return 'This action adds a new costCode';
  }

  findAll() {
    return `This action returns all costCodes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costCode`;
  }

  update(id: number, updateCostCodeDto: UpdateCostCodeDto) {
    return `This action updates a #${id} costCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} costCode`;
  }
}
