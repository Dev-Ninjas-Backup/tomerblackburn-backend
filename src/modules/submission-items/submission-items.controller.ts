import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubmissionItemsService } from './submission-items.service';
import { CreateSubmissionItemDto } from './dto/create-submission-item.dto';
import { UpdateSubmissionItemDto } from './dto/update-submission-item.dto';

@Controller('submission-items')
export class SubmissionItemsController {
  constructor(private readonly submissionItemsService: SubmissionItemsService) {}

  @Post()
  create(@Body() createSubmissionItemDto: CreateSubmissionItemDto) {
    return this.submissionItemsService.create(createSubmissionItemDto);
  }

  @Get()
  findAll() {
    return this.submissionItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubmissionItemDto: UpdateSubmissionItemDto) {
    return this.submissionItemsService.update(+id, updateSubmissionItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.submissionItemsService.remove(+id);
  }
}
