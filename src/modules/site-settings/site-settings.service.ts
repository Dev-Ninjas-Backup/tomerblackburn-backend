import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSiteSettingsDto } from './dto/create-site-settings.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    try {
      let settings = await this.prisma.siteSettings.findFirst({
        include: {
          logoImage: true,
        },
      });

      if (!settings) {
        // Create default settings if none exist
        settings = await this.prisma.siteSettings.create({
          data: {
            siteTitle: 'BBurn Builders',
            siteDescription: 'Premium bathroom remodeling services',
          },
          include: {
            logoImage: true,
          },
        });
      }

      return {
        message: 'Site settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve site settings: ${error.message}`);
    }
  }

  async create(createDto: CreateSiteSettingsDto) {
    try {
      // Check if settings already exist
      const existing = await this.prisma.siteSettings.findFirst();

      if (existing) {
        // Update existing settings instead
        return this.update(existing.id, createDto);
      }

      const settings = await this.prisma.siteSettings.create({
        data: createDto,
        include: {
          logoImage: true,
        },
      });

      return {
        message: 'Site settings created successfully',
        data: settings,
      };
    } catch (error) {
      throw new Error(`Failed to create site settings: ${error.message}`);
    }
  }

  async update(id: string, updateDto: UpdateSiteSettingsDto) {
    try {
      const existing = await this.prisma.siteSettings.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Site settings with ID ${id} not found`);
      }

      const settings = await this.prisma.siteSettings.update({
        where: { id },
        data: updateDto,
        include: {
          logoImage: true,
        },
      });

      return {
        message: 'Site settings updated successfully',
        data: settings,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update site settings: ${error.message}`);
    }
  }

  async updateCurrent(updateDto: UpdateSiteSettingsDto) {
    try {
      let settings = await this.prisma.siteSettings.findFirst();

      if (!settings) {
        // Create new settings
        return this.create(updateDto as CreateSiteSettingsDto);
      }

      return this.update(settings.id, updateDto);
    } catch (error) {
      throw new Error(`Failed to update site settings: ${error.message}`);
    }
  }
}
