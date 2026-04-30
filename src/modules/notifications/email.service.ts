import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromEmail: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Support both new SMTP_* env keys and legacy EMAIL_* keys
    const host =
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('EMAIL_HOST');
    const port =
      Number(this.configService.get<string>('SMTP_PORT')) ||
      Number(this.configService.get<string>('EMAIL_PORT'));
    const user =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('EMAIL_USER');
    const pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('EMAIL_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('EMAIL_FROM') ||
      user;
    this.fromEmail = from ? `BBurn Builders <${from}>` : undefined;

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        'Email configuration is missing. Emails will not be sent.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });

    this.logger.log('Email transporter initialized successfully');
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  async sendSubmissionEmail(
    submissionId: string,
    clientEmail: string,
    clientName: string,
    submissionNumber: string,
    pdfUrl: string,
    pdfBuffer?: Buffer,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        'Email transporter not configured. Skipping email send.',
      );
      return false;
    }

    try {
      const firstName = clientName.split(' ')[0];
      const emailOptions: EmailOptions = {
        to: clientEmail,
        subject: `Your Estimate Has Been Received — Next Steps`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
            <p>Hi ${firstName},</p>
            <p>Thank you for taking the time to complete your estimate! We've received your submission and our team is currently reviewing the details.</p>
            <p>This estimate is designed to provide a strong starting point based on our experience and the information you've shared, including your selections, notes, and any photos or videos. In many cases, we're able to confirm scope and budget with just a few follow-up questions. If anything needs further clarification, we'll let you know and can coordinate a walkthrough to ensure everything is fully accounted for.</p>
            <p>Once we're aligned on scope and budget, we'll schedule a time for your project manager to meet with you on-site to take detailed measurements and walk through the project together. From there, we'll develop a clear plan along with a visual rendering so you can review and approve everything before construction begins.</p>
            <p>In the meantime, feel free to reply with any additional details you'd like us to consider.</p>
            <p>We look forward to connecting with you soon.</p>
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
        attachments: [
          {
            filename: `${submissionNumber}-estimate.pdf`,
            content: pdfBuffer,
          },
          {
            filename: 'Example_Docs.pdf',
            path: '/app/Example_Docs.pdf',
          },
        ],
      };

      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        attachments: emailOptions.attachments,
      });

      this.logger.log(
        `Email sent successfully to ${clientEmail}: ${info.messageId}`,
      );
      console.log(
        `[EmailService] Submission email sent to ${clientEmail} (submissionId=${submissionId}, messageId=${info.messageId})`,
      );

      // Log the email
      await this.prisma.emailLog.create({
        data: {
          submissionId,
          emailType: 'submission_confirmation',
          recipientEmail: clientEmail,
          recipientName: clientName,
          subject: emailOptions.subject,
          body: emailOptions.html,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${clientEmail}: ${error.message}`,
        error.stack,
      );
      console.error(
        `[EmailService] Failed to send submission email to ${clientEmail} (submissionId=${submissionId})`,
        error,
      );

      // Log the failed email
      await this.prisma.emailLog.create({
        data: {
          submissionId,
          emailType: 'submission_confirmation',
          recipientEmail: clientEmail,
          recipientName: clientName,
          subject: `Your Estimate Has Been Received — Next Steps`,
          body: '',
          status: 'failed',
          errorMessage: error.message,
        },
      });

      return false;
    }
  }

  async sendAdminNewSubmissionNotification(params: {
    toEmail: string;
    submissionNumber: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    totalAmount: number;
    serviceName?: string;
  }): Promise<boolean> {
    if (!this.transporter) return false;

    const {
      toEmail,
      submissionNumber,
      clientName,
      clientEmail,
      clientPhone,
      totalAmount,
      serviceName,
    } = params;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: `New Submission Received — ${submissionNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
            <h2 style="color: #2d4a8f;">New Estimate Submission</h2>
            <p>A new estimate submission has been received on BBurn Builders.</p>
            <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; font-weight: bold; color: #555; width: 40%;">Submission #</td><td style="padding: 8px;">${submissionNumber}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #555;">Client Name</td><td style="padding: 8px;">${clientName}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Client Email</td><td style="padding: 8px;">${clientEmail}</td></tr>
              ${clientPhone ? `<tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #555;">Phone</td><td style="padding: 8px;">${clientPhone}</td></tr>` : ''}
              ${serviceName ? `<tr><td style="padding: 8px; font-weight: bold; color: #555;">Service</td><td style="padding: 8px;">${serviceName}</td></tr>` : ''}
              <tr style="background:#f9f9f9"><td style="padding: 8px; font-weight: bold; color: #555;">Total Amount</td><td style="padding: 8px; font-weight: bold; color: #2d4a8f;">$${totalAmount.toLocaleString()}</td></tr>
            </table>
            <p style="color: #888; font-size: 13px;">Log in to the admin dashboard to view the full submission details.</p>
          </div>
        `,
      });

      this.logger.log(
        `Admin notification sent to ${toEmail} for submission ${submissionNumber}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send admin notification: ${error.message}`);
      return false;
    }
  }

  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      const msg = 'Email transporter not configured. Check SMTP env variables.';
      this.logger.warn(msg);
      return { success: false, error: msg };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${info.messageId}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
        error.stack,
      );
      return { success: false, error: error.message };
    }
  }
}
