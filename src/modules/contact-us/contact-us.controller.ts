import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import {
  UpdateContactUsDto,
  ContactUsResponseDto,
} from './dto/update-contact-us.dto';

@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit contact form',
    description: 'Submit a new contact form inquiry',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contact form submitted successfully',
    type: ContactUsResponseDto,
  })
  create(@Body() createDto: CreateContactUsDto) {
    return this.contactUsService.create(createDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all contact submissions',
    description: 'Retrieve all contact form submissions with optional filter',
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    description: 'Filter by read status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submissions retrieved successfully',
    type: [ContactUsResponseDto],
  })
  findAll(@Query('isRead') isRead?: string) {
    const readFilter =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.contactUsService.findAll(readFilter);
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get unread count',
    description: 'Get count of unread contact submissions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unread count retrieved successfully',
  })
  getUnreadCount() {
    return this.contactUsService.getUnreadCount();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact submission by ID',
    description: 'Retrieve a specific contact submission',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact submission ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submission retrieved successfully',
    type: ContactUsResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update contact submission',
    description: 'Update a contact submission',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact submission ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submission updated successfully',
    type: ContactUsResponseDto,
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateContactUsDto) {
    return this.contactUsService.update(id, updateDto);
  }

  @Patch(':id/mark-read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark as read',
    description: 'Mark a contact submission as read',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact submission ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submission marked as read',
  })
  markAsRead(@Param('id') id: string) {
    return this.contactUsService.markAsRead(id);
  }

  @Patch(':id/mark-unread')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark as unread',
    description: 'Mark a contact submission as unread',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact submission ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submission marked as unread',
  })
  markAsUnread(@Param('id') id: string) {
    return this.contactUsService.markAsUnread(id);
  }

  @Post('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark all as read',
    description: 'Mark all contact submissions as read',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All contact submissions marked as read',
  })
  markAllAsRead() {
    return this.contactUsService.markAllAsRead();
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete contact submission',
    description: 'Delete a contact submission',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact submission ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact submission deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.contactUsService.remove(id);
  }
}
