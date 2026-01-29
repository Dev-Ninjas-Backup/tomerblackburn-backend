import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import axios, { AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);
  private readonly builderTrendUrl =
    'https://buildertrend.net/leads/contactforms/ContactFormFrame.aspx?builderID=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJidWlsZGVySWQiOjYxNzI1fQ.2b-qQpNHXdw4r7_31Hsno4r7mpK1_5LIDhB3__sOsEE';

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateContactUsDto) {
    try {
      const contact = await this.prisma.contactUs.create({
        data: createDto,
      });

      this.sendToBuilderTrend(createDto).catch((error) => {
        this.logger.error(
          `Failed to send contact form to BuilderTrend: ${error.message}`,
          error.stack,
        );
      });

      return {
        message: 'Contact form submitted successfully',
        data: contact,
      };
    } catch (error) {
      throw new Error(`Failed to submit contact form: ${error.message}`);
    }
  }

  private async sendToBuilderTrend(data: CreateContactUsDto): Promise<void> {
    const cheerio = await import('cheerio');

    try {
      this.logger.log('=== Starting BuilderTrend Integration ===');
      this.logger.log(`Data to send: ${JSON.stringify(data, null, 2)}`);

      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar }));

      this.logger.log(`Fetching form from: ${this.builderTrendUrl}`);
      const formResponse = await client.get(this.builderTrendUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive',
        },
      });

      this.logger.log(
        `✅ Retrieved BuilderTrend form (Status: ${formResponse.status})`,
      );

      const $ = cheerio.load(formResponse.data);
      const formData = new URLSearchParams();

      let hiddenFieldCount = 0;
      $('input[type="hidden"]').each((_, elem) => {
        const name = $(elem).attr('name');
        const value = $(elem).attr('value') || '';
        if (name) {
          formData.append(name, value);
          hiddenFieldCount++;
          if (name === '__VIEWSTATE') {
            this.logger.log(`  ✓ __VIEWSTATE found (${value.length} chars)`);
          } else if (name === '__EVENTVALIDATION') {
            this.logger.log(
              `  ✓ __EVENTVALIDATION found (${value.length} chars)`,
            );
          } else if (name === '__VIEWSTATEGENERATOR') {
            this.logger.log(`  ✓ __VIEWSTATEGENERATOR = ${value}`);
          } else {
            this.logger.log(`  Hidden field: ${name} = ${value}`);
          }
        }
      });

      this.logger.log(`Extracted ${hiddenFieldCount} hidden fields from form`);

      if (!formData.has('__VIEWSTATE')) {
        throw new Error(
          'Missing __VIEWSTATE - BuilderTrend form structure may have changed',
        );
      }
      if (!formData.has('__EVENTVALIDATION')) {
        this.logger.warn(
          '⚠️ __EVENTVALIDATION not found - submission may fail',
        );
      }

      formData.delete('__EVENTTARGET');
      formData.delete('__EVENTARGUMENT');

      formData.set(
        'ctl00$ctl00$ctl00$MasterMain$MasterMain$MasterMain$btnSubmit',
        'Submit',
      );

      const fieldPrefix = 'ctl00$ctl00$ctl00$MasterMain$MasterMain$MasterMain$';

      const fieldsToSet = {
        LeadContactFirstName: data.firstName,
        LeadContactLastName: data.lastName,
        LeadEmail: data.email,
        LeadPhone: data.phone,
        LeadStreet: data.address,
        LeadCity: data.city,
        LeadState: data.state,
        LeadZip: data.zipCode,
        LeadGeneralNotes: data.message,
      };

      Object.entries(fieldsToSet).forEach(([field, value]) => {
        formData.set(`${fieldPrefix}${field}`, value);
      });

      if (data.projectStartDate) {
        const date = new Date(data.projectStartDate);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
        formData.set(
          `${fieldPrefix}LeadEstimatedConversionDate$Textbox1`,
          formattedDate,
        );
        this.logger.log(`Project start date formatted: ${formattedDate}`);
      }

      formData.set(`${fieldPrefix}txtConfirmCaptcha`, '2');
      formData.set(`${fieldPrefix}hidCaptchaText`, '');
      formData.set('g-recaptcha-response', '');

      this.logger.log('Security question answered: 1+1=2');

      this.logger.log('=== Form Data to Submit ===');
      const formDataObj: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (key === '__VIEWSTATE' || key === '__EVENTVALIDATION') {
          formDataObj[key] = `[${value.length} characters]`;
        } else {
          formDataObj[key] = value;
        }
      });
      this.logger.log(JSON.stringify(formDataObj, null, 2));

      this.logger.log('=== Submitting Form ===');
      const response = await client.post(this.builderTrendUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Referer: this.builderTrendUrl,
          Origin: 'https://buildertrend.net',
          Connection: 'keep-alive',
        },
        maxRedirects: 5,
        validateStatus: () => true,
      });

      this.logger.log(`Response Status: ${response.status}`);
      this.logger.log(
        `Final URL: ${response.request?.res?.responseUrl || response.config?.url}`,
      );

      const responseHtml = String(response.data);

      const hasFormFields =
        responseHtml.includes('txtFirstName') &&
        responseHtml.includes('txtLastName');

      const hasValidationError =
        responseHtml.includes('required field') ||
        responseHtml.includes('Please enter') ||
        responseHtml.includes('Please complete') ||
        responseHtml.includes('field is required') ||
        (responseHtml.includes('captcha') && responseHtml.includes('Please'));

      const hasSuccess =
        responseHtml.toLowerCase().includes('thank you') ||
        responseHtml.toLowerCase().includes('successfully submitted') ||
        responseHtml.toLowerCase().includes('received your');

      this.logger.log(`Response analysis:`);
      this.logger.log(`  - Form re-rendered: ${hasFormFields}`);
      this.logger.log(`  - Validation error: ${hasValidationError}`);
      this.logger.log(`  - Success message: ${hasSuccess}`);

      const $response = cheerio.load(responseHtml);
      const errorMessages: string[] = [];
      $response(
        '.error, .validation-error, .field-validation-error, .alert-danger',
      ).each((_, elem) => {
        const text = $response(elem).text().trim();
        if (text) {
          errorMessages.push(text);
        }
      });

      if (errorMessages.length > 0) {
        this.logger.error(
          `Validation errors found: ${JSON.stringify(errorMessages)}`,
        );
      }

      const fs = await import('fs/promises');
      const path = await import('path');
      const responseFile = path.join(
        process.cwd(),
        'buildertrend-response.html',
      );
      await fs.writeFile(responseFile, responseHtml);
      this.logger.log(`Full response saved to: ${responseFile}`);

      const snippet = responseHtml.substring(0, 1500).replace(/\s+/g, ' ');
      this.logger.log(`Response snippet: ${snippet.substring(0, 500)}...`);

      const finalUrl =
        response.request?.res?.responseUrl || response.config?.url;
      const urlChanged = finalUrl !== this.builderTrendUrl;

      if (urlChanged) {
        this.logger.log(`🔄 URL changed to: ${finalUrl}`);
      }

      if (hasSuccess && !hasFormFields) {
        this.logger.log('✅ BuilderTrend submission appears successful!');
      } else if (hasFormFields) {
        this.logger.error(
          '❌ Form was re-rendered - submission failed (likely validation/captcha)',
        );
      } else if (!hasFormFields && !hasValidationError) {
        this.logger.log(
          '✅ Form NOT re-rendered - submission likely successful! Check BuilderTrend admin.',
        );
      } else {
        this.logger.warn(
          `⚠️ BuilderTrend response unclear - Status: ${response.status}`,
        );
        this.logger.warn(
          'Check buildertrend-response.html and BuilderTrend admin panel',
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`❌ BuilderTrend Error: ${error.message}`);
        this.logger.error(`Status: ${error.response?.status || 'N/A'}`);
        if (error.response?.data) {
          const errorSnippet = String(error.response.data)
            .substring(0, 1000)
            .replace(/\s+/g, ' ');
          this.logger.error(`Response: ${errorSnippet}`);
        }
      } else {
        this.logger.error(
          `❌ BuilderTrend Error: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  async findAll(isRead?: boolean) {
    try {
      const where = isRead !== undefined ? { isRead } : {};

      const contacts = await this.prisma.contactUs.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return {
        message:
          contacts.length > 0
            ? 'Contact submissions retrieved successfully'
            : 'No contact submissions found',
        count: contacts.length,
        data: contacts,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve contact submissions: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const contact = await this.prisma.contactUs.findUnique({
        where: { id },
      });

      if (!contact) {
        throw new NotFoundException(
          `Contact submission with ID ${id} not found`,
        );
      }

      return {
        message: 'Contact submission retrieved successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve contact submission: ${error.message}`,
      );
    }
  }

  async update(id: string, updateDto: UpdateContactUsDto) {
    try {
      await this.findOne(id);

      const contact = await this.prisma.contactUs.update({
        where: { id },
        data: updateDto,
      });

      return {
        message: 'Contact submission updated successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update contact submission: ${error.message}`);
    }
  }

  async markAsRead(id: string) {
    try {
      await this.findOne(id);

      const contact = await this.prisma.contactUs.update({
        where: { id },
        data: { isRead: true },
      });

      return {
        message: 'Contact submission marked as read',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to mark contact submission as read: ${error.message}`,
      );
    }
  }

  async markAsUnread(id: string) {
    try {
      await this.findOne(id);

      const contact = await this.prisma.contactUs.update({
        where: { id },
        data: { isRead: false },
      });

      return {
        message: 'Contact submission marked as unread',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to mark contact submission as unread: ${error.message}`,
      );
    }
  }

  async markAllAsRead() {
    try {
      const result = await this.prisma.contactUs.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      return {
        message: `${result.count} contact submissions marked as read`,
        count: result.count,
      };
    } catch (error) {
      throw new Error(
        `Failed to mark all contact submissions as read: ${error.message}`,
      );
    }
  }

  async getUnreadCount() {
    try {
      const count = await this.prisma.contactUs.count({
        where: { isRead: false },
      });

      return {
        message: 'Unread count retrieved successfully',
        count,
      };
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.prisma.contactUs.delete({
        where: { id },
      });

      return {
        message: 'Contact submission deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete contact submission: ${error.message}`);
    }
  }
}
