import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostCodesService } from './cost-codes.service';
import { CreateCostCodeDto } from './dto/create-cost-code.dto';
import { UpdateCostCodeDto } from './dto/update-cost-code.dto';

@Controller('cost-codes')
export class CostCodesController {
  constructor(private readonly costCodesService: CostCodesService) {}

  @Post()
  create(@Body() createCostCodeDto: CreateCostCodeDto) {
    return this.costCodesService.create(createCostCodeDto);
  }

  @Get()
  findAll() {
    return this.costCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCodesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostCodeDto: UpdateCostCodeDto) {
    return this.costCodesService.update(+id, updateCostCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCodesService.remove(+id);
  }
}
