import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AboutUsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAboutUs() {
    try {
      let aboutUs = await this.prisma.aboutUs.findFirst({
        include: {
          image: true,
        },
      });

      if (!aboutUs) {
        // Create default about us if none exists
        aboutUs = await this.prisma.aboutUs.create({
          data: {
            title: 'Our Philosophy',
            ownerInfo: 'From Tomer Blackburn, BBurn Builders founder & owner',
            description:
              'I started BBurn Builders to bring the focus of the construction industry back where it belongs: on client communication and satisfaction.',
          },
          include: {
            image: true,
          },
        });
      }

      return {
        message: 'About us page retrieved successfully',
        data: aboutUs,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve about us page: ${error.message}`);
    }
  }

  async create(createDto: CreateAboutUsDto) {
    try {
      // Check if about us already exists
      const existing = await this.prisma.aboutUs.findFirst();

      if (existing) {
        // Update existing instead
        return this.update(existing.id, createDto);
      }

      const aboutUs = await this.prisma.aboutUs.create({
        data: createDto,
        include: {
          image: true,
        },
      });

      return {
        message: 'About us page created successfully',
        data: aboutUs,
      };
    } catch (error) {
      throw new Error(`Failed to create about us page: ${error.message}`);
    }
  }

  async update(id: string, updateDto: UpdateAboutUsDto) {
    try {
      const existing = await this.prisma.aboutUs.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`About us page with ID ${id} not found`);
      }

      const aboutUs = await this.prisma.aboutUs.update({
        where: { id },
        data: updateDto,
        include: {
          image: true,
        },
      });

      return {
        message: 'About us page updated successfully',
        data: aboutUs,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update about us page: ${error.message}`);
    }
  }

  async updateCurrent(updateDto: UpdateAboutUsDto) {
    try {
      const aboutUs = await this.prisma.aboutUs.findFirst();

      if (!aboutUs) {
        return this.create(updateDto as CreateAboutUsDto);
      }

      return this.update(aboutUs.id, updateDto);
    } catch (error) {
      throw new Error(`Failed to update about us page: ${error.message}`);
    }
  }
}
