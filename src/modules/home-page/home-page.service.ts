import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateHomePageDto,
  CreateServiceStandsOutDto,
} from './dto/create-home-page.dto';
import {
  UpdateHomePageDto,
  UpdateServiceStandsOutDto,
} from './dto/update-home-page.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class HomePageService {
  constructor(private readonly prisma: PrismaService) {}

  // HomePage methods
  async getHomePage() {
    try {
      let homePage = await this.prisma.homePage.findFirst({
        include: {
          homeBackgroundImage: true,
        },
      });

      if (!homePage) {
        // Create default home page if none exists
        homePage = await this.prisma.homePage.create({
          data: {
            title: 'Calculate Your Bathroom Remodeling Cost',
            subTitle:
              'From Minor Fixes to Full Renovations. We Treat Every Job With Care.',
            ourMissionTitle: 'Our Mission',
            ourMissionSubTitle:
              'BBurn Builders is here to change that. Our mission is to put the focus back where it belongs on client communication and satisfaction.',
          },
          include: {
            homeBackgroundImage: true,
          },
        });
      }

      return {
        message: 'Home page retrieved successfully',
        data: homePage,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve home page: ${error.message}`);
    }
  }

  async createHomePage(createDto: CreateHomePageDto) {
    try {
      // Check if home page already exists
      const existing = await this.prisma.homePage.findFirst();

      if (existing) {
        // Update existing instead
        return this.updateHomePage(existing.id, createDto);
      }

      const homePage = await this.prisma.homePage.create({
        data: createDto,
        include: {
          homeBackgroundImage: true,
        },
      });

      return {
        message: 'Home page created successfully',
        data: homePage,
      };
    } catch (error) {
      throw new Error(`Failed to create home page: ${error.message}`);
    }
  }

  async updateHomePage(id: string, updateDto: UpdateHomePageDto) {
    try {
      const existing = await this.prisma.homePage.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Home page with ID ${id} not found`);
      }

      const homePage = await this.prisma.homePage.update({
        where: { id },
        data: updateDto,
        include: {
          homeBackgroundImage: true,
        },
      });

      return {
        message: 'Home page updated successfully',
        data: homePage,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update home page: ${error.message}`);
    }
  }

  async updateCurrentHomePage(updateDto: UpdateHomePageDto) {
    try {
      const homePage = await this.prisma.homePage.findFirst();

      if (!homePage) {
        return this.createHomePage(updateDto as CreateHomePageDto);
      }

      return this.updateHomePage(homePage.id, updateDto);
    } catch (error) {
      throw new Error(`Failed to update home page: ${error.message}`);
    }
  }

  // ServiceStandsOut methods
  async getAllServices() {
    try {
      const services = await this.prisma.serviceStandsOut.findMany({
        include: {
          image: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return {
        message:
          services.length > 0
            ? 'Services retrieved successfully'
            : 'No services found',
        count: services.length,
        data: services,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve services: ${error.message}`);
    }
  }

  async getServiceById(id: string) {
    try {
      const service = await this.prisma.serviceStandsOut.findUnique({
        where: { id },
        include: {
          image: true,
        },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      return {
        message: 'Service retrieved successfully',
        data: service,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve service: ${error.message}`);
    }
  }

  async createService(createDto: CreateServiceStandsOutDto) {
    try {
      const service = await this.prisma.serviceStandsOut.create({
        data: createDto,
        include: {
          image: true,
        },
      });

      return {
        message: 'Service created successfully',
        data: service,
      };
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  async updateService(id: string, updateDto: UpdateServiceStandsOutDto) {
    try {
      await this.getServiceById(id);

      const service = await this.prisma.serviceStandsOut.update({
        where: { id },
        data: updateDto,
        include: {
          image: true,
        },
      });

      return {
        message: 'Service updated successfully',
        data: service,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  async deleteService(id: string) {
    try {
      await this.getServiceById(id);

      await this.prisma.serviceStandsOut.delete({
        where: { id },
      });

      return {
        message: 'Service deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }

  // Get complete home page data (for frontend)
  async getCompleteHomePageData() {
    try {
      const [homePage, services] = await Promise.all([
        this.getHomePage(),
        this.getAllServices(),
      ]);

      return {
        message: 'Complete home page data retrieved successfully',
        data: {
          homePage: homePage.data,
          services: services.data,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve complete home page data: ${error.message}`,
      );
    }
  }
}
