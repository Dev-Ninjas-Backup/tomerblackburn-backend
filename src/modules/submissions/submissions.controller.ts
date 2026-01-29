import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { CreateNextStepDto } from './dto/create-next-step.dto';
import { UpdateNextStepDto } from './dto/update-next-step.dto';
import { UpdateWhatHappensNextDto } from './dto/update-what-happens-next.dto';
import { SubmissionStatus } from 'generated/prisma/enums';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new estimate submission' })
  create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all submissions' })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  findAll(@Query('status') status?: SubmissionStatus) {
    return this.submissionsService.findAll(status);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.submissionsService.getDashboardStats();
  }

  @Get('what-happens-next')
  @ApiOperation({ summary: 'Get what happens next steps after submission' })
  getWhatHappensNext() {
    return this.submissionsService.getWhatHappensNext();
  }

  @Post('what-happens-next')
  @ApiOperation({
    summary: 'Create or update what happens next steps in bulk',
  })
  updateWhatHappensNext(
    @Body() updateWhatHappensNextDto: UpdateWhatHappensNextDto,
  ) {
    return this.submissionsService.updateWhatHappensNextSteps(
      updateWhatHappensNextDto,
    );
  }

  @Get('by-number/:submissionNumber')
  @ApiOperation({ summary: 'Get submission by submission number' })
  findBySubmissionNumber(@Param('submissionNumber') submissionNumber: string) {
    return this.submissionsService.findBySubmissionNumber(submissionNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission by ID' })
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update submission' })
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update submission status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubmissionStatus,
  ) {
    return this.submissionsService.updateStatus(id, status);
  }

  @Post(':id/media')
  @ApiOperation({ summary: 'Add media to submission' })
  addMedia(
    @Param('id') id: string,
    @Body()
    body: {
      fileInstanceId: string;
      mediaType: 'PHOTO' | 'VIDEO';
      description?: string;
    },
  ) {
    return this.submissionsService.addMedia(
      id,
      body.fileInstanceId,
      body.mediaType,
      body.description,
    );
  }

  @Delete('media/:mediaId')
  @ApiOperation({ summary: 'Remove media from submission' })
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.submissionsService.removeMedia(mediaId);
  }

  @Post(':id/regenerate-pdf')
  @ApiOperation({ summary: 'Regenerate PDF for submission' })
  regeneratePdf(@Param('id') id: string) {
    return this.submissionsService.regeneratePdf(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete submission' })
  remove(@Param('id') id: string) {
    return this.submissionsService.remove(id);
  }

  // Next Steps CRUD endpoints
  @Post('next-steps')
  @ApiOperation({ summary: 'Create a new next step' })
  createNextStep(@Body() createNextStepDto: CreateNextStepDto) {
    return this.submissionsService.createNextStep(createNextStepDto);
  }

  @Get('next-steps')
  @ApiOperation({ summary: 'Get all next steps' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive steps',
  })
  getAllNextSteps(@Query('includeInactive') includeInactive: string | boolean) {
    const shouldIncludeInactive =
      includeInactive === 'true' || includeInactive === true;
    return this.submissionsService.getAllNextSteps(shouldIncludeInactive);
  }

  @Get('next-steps/:id')
  @ApiOperation({ summary: 'Get a next step by ID' })
  getNextStepById(@Param('id') id: string) {
    return this.submissionsService.getNextStepById(id);
  }

  @Patch('next-steps/:id')
  @ApiOperation({ summary: 'Update a next step' })
  updateNextStep(
    @Param('id') id: string,
    @Body() updateNextStepDto: UpdateNextStepDto,
  ) {
    return this.submissionsService.updateNextStep(id, updateNextStepDto);
  }

  @Delete('next-steps/:id')
  @ApiOperation({ summary: 'Delete a next step' })
  deleteNextStep(@Param('id') id: string) {
    return this.submissionsService.deleteNextStep(id);
  }
}
