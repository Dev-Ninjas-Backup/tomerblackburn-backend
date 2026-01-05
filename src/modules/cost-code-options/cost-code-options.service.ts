import { Injectable } from '@nestjs/common';
import { CreateCostCodeOptionDto } from './dto/create-cost-code-option.dto';
import { UpdateCostCodeOptionDto } from './dto/update-cost-code-option.dto';

@Injectable()
export class CostCodeOptionsService {
  create(createCostCodeOptionDto: CreateCostCodeOptionDto) {
    return 'This action adds a new costCodeOption';
  }

  findAll() {
    return `This action returns all costCodeOptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costCodeOption`;
  }

  update(id: number, updateCostCodeOptionDto: UpdateCostCodeOptionDto) {
    return `This action updates a #${id} costCodeOption`;
  }

  remove(id: number) {
    return `This action removes a #${id} costCodeOption`;
  }
}
