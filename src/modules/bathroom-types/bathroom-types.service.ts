import { Injectable } from '@nestjs/common';
import { CreateBathroomTypeDto } from './dto/create-bathroom-type.dto';
import { UpdateBathroomTypeDto } from './dto/update-bathroom-type.dto';

@Injectable()
export class BathroomTypesService {
  create(createBathroomTypeDto: CreateBathroomTypeDto) {
    return 'This action adds a new bathroomType';
  }

  findAll() {
    return `This action returns all bathroomTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bathroomType`;
  }

  update(id: number, updateBathroomTypeDto: UpdateBathroomTypeDto) {
    return `This action updates a #${id} bathroomType`;
  }

  remove(id: number) {
    return `This action removes a #${id} bathroomType`;
  }
}
