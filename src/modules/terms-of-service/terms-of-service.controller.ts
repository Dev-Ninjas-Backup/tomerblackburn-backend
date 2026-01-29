import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TermsOfServiceService } from './terms-of-service.service';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { UpdateTermsOfServiceDto } from './dto/update-terms-of-service.dto';

@ApiTags('Terms of Service')
@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsOfServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Get terms of service' })
  get() {
    return this.termsOfServiceService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update terms of service' })
  createOrUpdate(@Body() createTermsOfServiceDto: CreateTermsOfServiceDto) {
    return this.termsOfServiceService.createOrUpdate(createTermsOfServiceDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update terms of service' })
  update(@Body() updateTermsOfServiceDto: UpdateTermsOfServiceDto) {
    return this.termsOfServiceService.createOrUpdate(updateTermsOfServiceDto);
  }
}
