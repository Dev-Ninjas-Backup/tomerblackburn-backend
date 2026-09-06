import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    cid?: string;
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
    totalAmount?: number | string,
    submittedAt?: Date | string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        'Email transporter not configured. Skipping email send.',
      );
      return false;
    }

    try {
      const firstName = clientName.split(' ')[0] || clientName;
      // Build dynamic attachments array
      const attachments: any[] = [];
      if (pdfBuffer) {
        attachments.push({
          filename: `${submissionNumber}-estimate.pdf`,
          content: pdfBuffer,
        });
      }

      // Attach Logo for inline rendering
      let logoCid: string | undefined;
      try {
        const logoPath = path.join(process.cwd(), 'logo.png');
        const logoBuffer = await fs.readFile(logoPath);
        logoCid = 'bburnlogo';
        attachments.push({
          filename: 'logo.png',
          content: logoBuffer,
          cid: logoCid,
        });
      } catch (err) {
        this.logger.warn(`Could not attach logo as CID: ${err.message}`);
      }

      let guideFilename: string | undefined;
      let settings: any = null;
      try {
        settings = await this.prisma.siteSettings.findFirst({
          include: {
            guidePdf: true,
          },
        });

        if (settings?.guidePdf?.path) {
          const absolutePath = path.join(
            process.cwd(),
            'uploads',
            settings.guidePdf.path,
          );
          const fileBuffer = await fs.readFile(absolutePath);
          guideFilename =
            settings.guidePdf.originalFilename ||
            settings.guidePdf.filename ||
            'BBurn_Builders_Guide.pdf';
          attachments.push({
            filename: guideFilename,
            content: fileBuffer,
          });
        }
      } catch (error) {
        this.logger.error(
          `Failed to read or attach guide PDF setting: ${error.message}`,
          error.stack,
        );
      }

      let formattedTotal = '$0.00';
      let formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (totalAmount != null) {
        formattedTotal = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(totalAmount));
      }

      if (submittedAt) {
        formattedDate = new Date(submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (submissionId && (totalAmount == null || !submittedAt)) {
        try {
          const submissionRecord = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            select: { totalAmount: true, submittedAt: true },
          });
          if (submissionRecord) {
            if (totalAmount == null && submissionRecord.totalAmount != null) {
              formattedTotal = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(Number(submissionRecord.totalAmount));
            }
            if (!submittedAt && submissionRecord.submittedAt) {
              formattedDate = new Date(
                submissionRecord.submittedAt,
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }
          }
        } catch (dbErr) {
          this.logger.warn(
            `Could not query submission metadata for email: ${dbErr.message}`,
          );
        }
      }

      const replyToEmail =
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('EMAIL_FROM') ||
        'estimates@bburnbuilders.com';

      const subjectTemplate =
        settings?.estimateEmailSubject?.trim() ||
        'Your Estimate Has Been Received — Next Steps';
      const emailSubject = subjectTemplate
        .replace(/{submissionNumber}/gi, submissionNumber)
        .replace(/{firstName}/gi, firstName);

      const emailHtml = this.getSubmissionConfirmationEmailHtml({
        firstName,
        submissionNumber,
        formattedDate,
        formattedTotal,
        guideFilename,
        logoCid,
        replyToEmail,
        customIntro: settings?.estimateEmailIntro?.trim(),
        customBody: settings?.estimateEmailBody?.trim(),
        customClosing: settings?.estimateEmailClosing?.trim(),
      });

      const emailOptions: EmailOptions = {
        to: clientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments,
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

  private getSubmissionConfirmationEmailHtml(params: {
    firstName: string;
    submissionNumber: string;
    formattedDate: string;
    formattedTotal: string;
    guideFilename?: string;
    logoCid?: string;
    replyToEmail?: string;
    customIntro?: string;
    customBody?: string;
    customClosing?: string;
  }): string {
    const {
      firstName,
      submissionNumber,
      formattedDate,
      formattedTotal,
      guideFilename,
      logoCid,
      replyToEmail = 'estimates@bburnbuilders.com',
      customIntro,
      customBody,
      customClosing,
    } = params;

    const logoSrc = logoCid
      ? `cid:${logoCid}`
      : 'https://bburnbuilders.com/logo.png';

    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{firstName}/gi, firstName)
        .replace(/{submissionNumber}/gi, submissionNumber)
        .replace(/{totalAmount}/gi, formattedTotal)
        .replace(/{date}/gi, formattedDate);
    };

    const renderParagraphs = (rawText: string) => {
      return rawText
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">${replacePlaceholders(p).replace(/\n/g, '<br>')}</p>`,
        )
        .join('');
    };

    const introHtml = customIntro
      ? renderParagraphs(customIntro)
      : `<p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
          Thank you for taking the time to complete your estimate! We've received your submission and our team is currently reviewing the details.
        </p>`;

    const bodyHtml = customBody
      ? renderParagraphs(customBody)
      : `<p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
          This estimate is designed to provide a strong starting point based on our experience and the information you've shared, including your selections, notes, and any photos or videos. In many cases, we're able to confirm scope and budget with just a few follow-up questions. If anything needs further clarification, we'll let you know and can coordinate a walkthrough to ensure everything is fully accounted for.
        </p>
        <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
          Once we're aligned on scope and budget, we'll schedule a time for your project manager to meet with you on-site to take detailed measurements and walk through the project together. From there, we'll develop a clear plan along with a visual rendering so you can review and approve everything before construction begins.
        </p>`;

    const closingHtml = customClosing
      ? renderParagraphs(customClosing)
      : `<p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.65;">
          In the meantime, feel free to reply with any additional details you'd like us to consider.
        </p>
        <p style="margin: 0 0 26px; color: #334155; font-size: 15px; line-height: 1.65;">
          We look forward to connecting with you soon.
        </p>`;

    const attachmentsHtml = guideFilename
      ? `
              <!-- Attachments Callout Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #283878; border-radius: 6px; margin-bottom: 28px; padding: 14px 16px;">
                <tr>
                  <td width="30" valign="top">
                    <span style="font-size: 20px;">📎</span>
                  </td>
                  <td>
                    <div style="color: #283878; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                      2 Attached Documents:
                    </div>
                    <div style="color: #475569; font-size: 12px; line-height: 1.5;">
                      <strong>1. ${submissionNumber}-estimate.pdf</strong> — Detailed line-item summary of your selections.<br>
                      <strong>2. ${guideFilename}</strong> — Our official project timeline and roadmap guide.
                    </div>
                  </td>
                </tr>
              </table>
      `
      : `
              <!-- Attachments Callout Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #283878; border-radius: 6px; margin-bottom: 28px; padding: 14px 16px;">
                <tr>
                  <td width="30" valign="top">
                    <span style="font-size: 20px;">📎</span>
                  </td>
                  <td>
                    <div style="color: #283878; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                      Attached Document:
                    </div>
                    <div style="color: #475569; font-size: 12px; line-height: 1.5;">
                      <strong>1. ${submissionNumber}-estimate.pdf</strong> — Detailed line-item summary of your selections.
                    </div>
                  </td>
                </tr>
              </table>
      `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate Has Been Received — BBurn Builders</title>
  <style>
    /* Reset styles */
    body, table, td, p, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #334155;
    }
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">

  <!-- Main Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(40, 56, 120, 0.12), 0 8px 10px -6px rgba(40, 56, 120, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Project Navy Blue Header (#283878) -->
          <tr>
            <td style="background-color: #283878; padding: 26px 36px; border-bottom: 2px solid #d4af37;">
              <!-- Horizontal + Vertical Combined Lockup -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <!-- Logo Container -->
                  <td valign="middle" style="padding-right: 16px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle" style="background-color: #ffffff; width: 48px; height: 48px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                          <img src="${logoSrc}" alt="BBurn Builders Logo" width="34" height="34" style="display: block; width: 34px; height: 34px;" />
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Brand Name & Slogan (Vertical Stack next to Logo) -->
                  <td valign="middle" style="text-align: left;">
                    <div style="color: #ffffff; font-size: 21px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; line-height: 1.15;">
                      BBURN BUILDERS
                    </div>
                    <div style="color: #d4af37; font-size: 10.5px; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase; margin-top: 4px;">
                      Premier Custom Remodeling &amp; Construction
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Bar -->
          <tr>
            <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 13px 36px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #059669; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                    <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>
                    Estimate Received &bull; Under Review
                  </td>
                  <td align="right" style="color: #64748b; font-size: 12px; font-weight: 600;">
                    Reference: <strong style="color: #283878;">#${submissionNumber}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Body -->
          <tr>
            <td class="mobile-padding" style="padding: 36px 36px 28px 36px;">
              
              <!-- Greeting (Project Navy Blue) -->
              <h2 style="margin: 0 0 16px; color: #283878; font-size: 18px; font-weight: 700;">
                Hi ${firstName},
              </h2>

              <!-- Client Body Copy (Dynamic or Default) -->
              ${introHtml}
              ${bodyHtml}
              ${closingHtml}

              <!-- Estimate Overview Card (Project Navy Blue Accents) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <strong style="color: #283878; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px;">
                      📋 Project Estimate Overview
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Estimate Number:</td>
                        <td align="right" style="padding: 6px 0; color: #283878; font-weight: 700; font-size: 13px;">${submissionNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Submission Date:</td>
                        <td align="right" style="padding: 6px 0; color: #283878; font-weight: 600; font-size: 13px;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Estimated Total:</td>
                        <td align="right" style="padding: 6px 0; color: #283878; font-weight: 800; font-size: 17px;">${formattedTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Executive Process Roadmap -->
              <div style="margin-bottom: 28px;">
                <h3 style="margin: 0 0 16px; color: #283878; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; border-left: 3px solid #283878; padding-left: 10px;">
                  What Happens Next?
                </h3>

                <!-- Step 1 -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
                  <tr>
                    <td valign="top" width="40" style="padding-top: 1px;">
                      <div style="width: 28px; height: 28px; background-color: #283878; color: #ffffff; font-weight: 800; font-size: 12px; border-radius: 6px; text-align: center; line-height: 28px;">
                        01
                      </div>
                    </td>
                    <td>
                      <div style="color: #283878; font-weight: 700; font-size: 14px; margin-bottom: 3px;">
                        Scope &amp; Budget Review
                      </div>
                      <div style="color: #64748b; font-size: 13px; line-height: 1.5;">
                        We analyze your selections, notes, and photos to confirm scope and clarify any details.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Step 2 -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
                  <tr>
                    <td valign="top" width="40" style="padding-top: 1px;">
                      <div style="width: 28px; height: 28px; background-color: #283878; color: #ffffff; font-weight: 800; font-size: 12px; border-radius: 6px; text-align: center; line-height: 28px;">
                        02
                      </div>
                    </td>
                    <td>
                      <div style="color: #283878; font-weight: 700; font-size: 14px; margin-bottom: 3px;">
                        On-Site Walkthrough &amp; Measurements
                      </div>
                      <div style="color: #64748b; font-size: 13px; line-height: 1.5;">
                        Your dedicated Project Manager meets you on-site to take detailed laser measurements and walk through your space.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Step 3 -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="top" width="40" style="padding-top: 1px;">
                      <div style="width: 28px; height: 28px; background-color: #283878; color: #ffffff; font-weight: 800; font-size: 12px; border-radius: 6px; text-align: center; line-height: 28px;">
                        03
                      </div>
                    </td>
                    <td>
                      <div style="color: #283878; font-weight: 700; font-size: 14px; margin-bottom: 3px;">
                        3D Visual Rendering &amp; Final Build Plan
                      </div>
                      <div style="color: #64748b; font-size: 13px; line-height: 1.5;">
                        We create a comprehensive plan with 3D architectural renderings for your review and approval before construction begins.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Dynamic Attachments Box -->
              ${attachmentsHtml}

              <!-- Quick Action CTA Buttons -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #283878;">
                          <a href="mailto:${replyToEmail}?subject=Regarding%20Estimate%20${encodeURIComponent(submissionNumber)}" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 24px; display: inline-block; border-radius: 6px;">
                            💬 Reply to this Email
                          </a>
                        </td>
                        <td width="12"></td>
                        <td align="center" style="border-radius: 6px; background-color: #f8fafc; border: 1px solid #cbd5e1;">
                          <a href="tel:7734039950" target="_blank" style="font-size: 14px; font-weight: 700; color: #283878; text-decoration: none; padding: 12px 20px; display: inline-block; border-radius: 6px;">
                            📞 Call 773-403-9950
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Founder Signature (Project Navy Blue Styling) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px; color: #64748b; font-size: 14px;">Best,</p>
                    <div style="color: #283878; font-size: 16px; font-weight: 800;">Tomer Blackburn</div>
                    <div style="color: #64748b; font-size: 13px; font-weight: 600;">Owner</div>
                    <div style="color: #64748b; font-size: 13px; font-weight: 600;">BBurn Builders</div>
                    <div style="color: #283878; font-size: 13px; margin-top: 6px;">
                      <a href="https://instagram.com/bburnbuilders" target="_blank" style="color: #283878; text-decoration: none; font-weight: 600;">@bburnbuilders</a> &bull; 
                      <a href="tel:7734039950" style="color: #283878; text-decoration: none; font-weight: 600;">773-403-9950</a>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 36px; text-align: center;">
              <p style="margin: 0 0 6px; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                &copy; 2026 BBurn Builders LLC. All rights reserved. Licensed, Bonded &amp; Insured.<br>
                Chicago, IL &amp; Surrounding Areas &bull; <a href="https://bburnbuilders.com" target="_blank" style="color: #283878; text-decoration: underline;">bburnbuilders.com</a>
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 10px;">
                You received this email regarding your project estimate submission on bburnbuilders.com.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();
  }
}
