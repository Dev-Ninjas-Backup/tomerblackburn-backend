import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubmissionMediaService } from './submission-media.service';
import { CreateSubmissionMediaDto } from './dto/create-submission-media.dto';
import { UpdateSubmissionMediaDto } from './dto/update-submission-media.dto';

@Controller('submission-media')
export class SubmissionMediaController {
  constructor(private readonly submissionMediaService: SubmissionMediaService) {}

  @Post()
  create(@Body() createSubmissionMediaDto: CreateSubmissionMediaDto) {
    return this.submissionMediaService.create(createSubmissionMediaDto);
  }

  @Get()
  findAll() {
    return this.submissionMediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionMediaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubmissionMediaDto: UpdateSubmissionMediaDto) {
    return this.submissionMediaService.update(+id, updateSubmissionMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.submissionMediaService.remove(+id);
  }
}
