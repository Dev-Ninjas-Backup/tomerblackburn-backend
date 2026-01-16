import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ContactUsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateContactUsDto) {
    try {
      const contact = await this.prisma.contactUs.create({
        data: createDto,
      });

      return {
        message: 'Contact form submitted successfully',
        data: contact,
      };
    } catch (error) {
      throw new Error(`Failed to submit contact form: ${error.message}`);
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
