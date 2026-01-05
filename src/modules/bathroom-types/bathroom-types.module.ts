import { Module } from '@nestjs/common';
import { BathroomTypesService } from './bathroom-types.service';
import { BathroomTypesController } from './bathroom-types.controller';

@Module({
  controllers: [BathroomTypesController],
  providers: [BathroomTypesService],
})
export class BathroomTypesModule {}
