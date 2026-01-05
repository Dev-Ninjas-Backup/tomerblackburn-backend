import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';

@Controller('company-settings')
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  @Post()
  create(@Body() createCompanySettingDto: CreateCompanySettingDto) {
    return this.companySettingsService.create(createCompanySettingDto);
  }

  @Get()
  findAll() {
    return this.companySettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companySettingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanySettingDto: UpdateCompanySettingDto,
  ) {
    return this.companySettingsService.update(+id, updateCompanySettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companySettingsService.remove(+id);
  }
}
