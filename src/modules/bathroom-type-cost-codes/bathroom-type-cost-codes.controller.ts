import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BathroomTypeCostCodesService } from './bathroom-type-cost-codes.service';
import { CreateBathroomTypeCostCodeDto } from './dto/create-bathroom-type-cost-code.dto';
import { UpdateBathroomTypeCostCodeDto } from './dto/update-bathroom-type-cost-code.dto';

@Controller('bathroom-type-cost-codes')
export class BathroomTypeCostCodesController {
  constructor(
    private readonly bathroomTypeCostCodesService: BathroomTypeCostCodesService,
  ) {}

  @Post()
  create(@Body() createBathroomTypeCostCodeDto: CreateBathroomTypeCostCodeDto) {
    return this.bathroomTypeCostCodesService.create(
      createBathroomTypeCostCodeDto,
    );
  }

  @Get()
  findAll() {
    return this.bathroomTypeCostCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bathroomTypeCostCodesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBathroomTypeCostCodeDto: UpdateBathroomTypeCostCodeDto,
  ) {
    return this.bathroomTypeCostCodesService.update(
      +id,
      updateBathroomTypeCostCodeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bathroomTypeCostCodesService.remove(+id);
  }
}
