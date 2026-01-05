import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BathroomTypesService } from './bathroom-types.service';
import { CreateBathroomTypeDto } from './dto/create-bathroom-type.dto';
import { UpdateBathroomTypeDto } from './dto/update-bathroom-type.dto';

@Controller('bathroom-types')
export class BathroomTypesController {
  constructor(private readonly bathroomTypesService: BathroomTypesService) {}

  @Post()
  create(@Body() createBathroomTypeDto: CreateBathroomTypeDto) {
    return this.bathroomTypesService.create(createBathroomTypeDto);
  }

  @Get()
  findAll() {
    return this.bathroomTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bathroomTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBathroomTypeDto: UpdateBathroomTypeDto) {
    return this.bathroomTypesService.update(+id, updateBathroomTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bathroomTypesService.remove(+id);
  }
}
