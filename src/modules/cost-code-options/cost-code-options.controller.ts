import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CostCodeOptionsService } from './cost-code-options.service';
import { CreateCostCodeOptionDto } from './dto/create-cost-code-option.dto';
import { UpdateCostCodeOptionDto } from './dto/update-cost-code-option.dto';

@Controller('cost-code-options')
export class CostCodeOptionsController {
  constructor(
    private readonly costCodeOptionsService: CostCodeOptionsService,
  ) {}

  @Post()
  create(@Body() createCostCodeOptionDto: CreateCostCodeOptionDto) {
    return this.costCodeOptionsService.create(createCostCodeOptionDto);
  }

  @Get()
  findAll() {
    return this.costCodeOptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCodeOptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCostCodeOptionDto: UpdateCostCodeOptionDto,
  ) {
    return this.costCodeOptionsService.update(+id, updateCostCodeOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCodeOptionsService.remove(+id);
  }
}
