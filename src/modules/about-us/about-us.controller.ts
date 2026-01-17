import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';

@ApiTags('About Us')
@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Get()
  @ApiOperation({ summary: 'Get about us page content' })
  getAboutUs() {
    return this.aboutUsService.getAboutUs();
  }

  @Post()
  @ApiOperation({ summary: 'Create about us page content' })
  create(@Body() createDto: CreateAboutUsDto) {
    return this.aboutUsService.create(createDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current about us page content' })
  updateCurrent(@Body() updateDto: UpdateAboutUsDto) {
    return this.aboutUsService.updateCurrent(updateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update about us page by ID' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAboutUsDto) {
    return this.aboutUsService.update(id, updateDto);
  }
}
