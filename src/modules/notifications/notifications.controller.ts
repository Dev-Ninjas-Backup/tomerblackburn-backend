import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Body,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from './email.service';
import { PatchNotificationDto } from './dto/patch-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Post('test-email')
  @ApiOperation({
    summary: 'Send a test email',
    description: 'Sends a test email to verify SMTP configuration is working',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['to'],
      properties: {
        to: { type: 'string', example: 'test@example.com' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test email sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to send test email',
  })
  async sendTestEmail(@Body('to') to: string) {
    if (!to) {
      return { success: false, message: 'Recipient email address is required' };
    }

    const result = await this.emailService.sendEmail({
      to,
      subject: 'Test Email — BBurn Builders SMTP Check',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
          <p>This is a test email from BBurn Builders.</p>
          <p>If you received this, the SMTP configuration is working correctly.</p>
          <br>
          <p>
            Best,<br>
            Tomer Blackburn<br>
            Owner<br>
            BBurn Builders<br>
            @bburnbuilders<br>
            773-403-9950
          </p>
        </div>
      `,
    });

    if (result.success) {
      return { success: true, message: `Test email sent to ${to}` };
    }
    return {
      success: false,
      message: result.error ?? 'Failed to send test email.',
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recent activities (notifications)',
    description: 'Returns recent activity logs to show as notifications',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of activities to return (default 10, max 50)',
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    description: 'Filter by read status: true = read only, false = unread only',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent activities retrieved successfully',
  })
  async getRecentActivities(
    @Query('limit') limit?: string,
    @Query('isRead') isRead?: string,
  ) {
    const parsed = limit ? parseInt(limit, 10) : NaN;
    const take =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50) : 10;

    const readFilter =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined;

    const activities = await this.prisma.activityLog.findMany({
      where: {
        entityType: { in: ['submission', 'contact_us'] },
        ...(readFilter !== undefined && { isRead: readFilter }),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return activities;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update notification read status',
    description: 'Mark a notification as read or unread',
  })
  @ApiParam({ name: 'id', description: 'Notification (activity log) ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  async patch(@Param('id') id: string, @Body() dto: PatchNotificationDto) {
    const activity = await this.prisma.activityLog.findFirst({
      where: {
        id,
        entityType: { in: ['submission', 'contact_us'] },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const updated = await this.prisma.activityLog.update({
      where: { id },
      data: { isRead: dto.isRead },
    });

    return updated;
  }
}
