import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateHomePageDto,
  CreateServiceStandsOutDto,
} from './dto/create-home-page.dto';
import {
  UpdateHomePageDto,
  UpdateServiceStandsOutDto,
} from './dto/update-home-page.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class HomePageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Validate if file exists in database
   */
  private async validateFileExists(fileId: string): Promise<void> {
    if (!fileId || !fileId.trim()) {
      return; // Optional field, allow empty
    }

    const fileExists = await this.prisma.fileInstance.findUnique({
      where: { id: fileId },
    });

    if (!fileExists) {
      throw new BadRequestException(
        `File with ID '${fileId}' does not exist. Please upload the file first using the /upload endpoint.`,
      );
    }
  }

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

      // Validate homeBackgroundImageId if provided
      if (createDto.homeBackgroundImageId) {
        await this.validateFileExists(createDto.homeBackgroundImageId);
      }

      // Prepare data - exclude homeBackgroundImageId if it's not valid
      const data: any = {
        title: createDto.title,
        subTitle: createDto.subTitle,
        ourMissionTitle: createDto.ourMissionTitle,
        ourMissionSubTitle: createDto.ourMissionSubTitle,
      };

      // Only add homeBackgroundImageId if it's provided and not empty
      if (
        createDto.homeBackgroundImageId &&
        createDto.homeBackgroundImageId.trim()
      ) {
        data.homeBackgroundImageId = createDto.homeBackgroundImageId;
      }

      const homePage = await this.prisma.homePage.create({
        data,
        include: {
          homeBackgroundImage: true,
        },
      });

      return {
        message: 'Home page created successfully',
        data: homePage,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create home page: ${error.message}`,
      );
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

      // Validate homeBackgroundImageId if provided
      if (
        updateDto.homeBackgroundImageId &&
        updateDto.homeBackgroundImageId.trim()
      ) {
        await this.validateFileExists(updateDto.homeBackgroundImageId);
      }

      // Prepare data - handle homeBackgroundImageId properly
      const data: any = {};

      if (updateDto.title !== undefined) {
        data.title = updateDto.title;
      }

      if (updateDto.subTitle !== undefined) {
        data.subTitle = updateDto.subTitle;
      }

      if (updateDto.ourMissionTitle !== undefined) {
        data.ourMissionTitle = updateDto.ourMissionTitle;
      }

      if (updateDto.ourMissionSubTitle !== undefined) {
        data.ourMissionSubTitle = updateDto.ourMissionSubTitle;
      }

      // Only add homeBackgroundImageId if it's provided and not empty
      // Set to null if explicitly empty string to clear the relation
      if (updateDto.homeBackgroundImageId !== undefined) {
        data.homeBackgroundImageId =
          updateDto.homeBackgroundImageId &&
          updateDto.homeBackgroundImageId.trim()
            ? updateDto.homeBackgroundImageId
            : null;
      }

      const homePage = await this.prisma.homePage.update({
        where: { id },
        data,
        include: {
          homeBackgroundImage: true,
        },
      });

      return {
        message: 'Home page updated successfully',
        data: homePage,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update home page: ${error.message}`,
      );
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

  async createService(
    createDto: CreateServiceStandsOutDto,
    image?: Express.Multer.File,
  ) {
    try {
      let imageId = createDto.imageId;

      // If image file is uploaded, upload it and get the file instance ID
      if (image) {
        const uploadedFile = await this.uploadService.uploadFile(image);
        imageId = uploadedFile.id;
      } else if (imageId) {
        // Only validate imageId if it was provided in DTO (not from uploaded file)
        await this.validateFileExists(imageId);
      }

      // Prepare data
      const data: any = {
        title: createDto.title,
        description: createDto.description,
      };

      // Only add imageId if it's provided and not empty
      if (imageId && imageId.trim()) {
        data.imageId = imageId;
      }

      const service = await this.prisma.serviceStandsOut.create({
        data,
        include: {
          image: true,
        },
      });

      return {
        message: 'Service created successfully',
        data: service,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create service: ${error.message}`,
      );
    }
  }

  async updateService(
    id: string,
    updateDto: UpdateServiceStandsOutDto,
    image?: Express.Multer.File,
  ) {
    try {
      await this.getServiceById(id);

      let imageId = updateDto.imageId;

      // If image file is uploaded, upload it and get the file instance ID
      if (image) {
        const uploadedFile = await this.uploadService.uploadFile(image);
        imageId = uploadedFile.id;
      } else if (imageId && imageId.trim()) {
        // Only validate imageId if it was provided in DTO (not from uploaded file)
        await this.validateFileExists(imageId);
      }

      // Prepare data - handle imageId properly
      const data: any = {};

      if (updateDto.title !== undefined) {
        data.title = updateDto.title;
      }

      if (updateDto.description !== undefined) {
        data.description = updateDto.description;
      }

      // Only add imageId if it's provided and not empty
      // Set to null if explicitly empty string to clear the relation
      if (imageId !== undefined) {
        data.imageId = imageId && imageId.trim() ? imageId : null;
      }

      const service = await this.prisma.serviceStandsOut.update({
        where: { id },
        data,
        include: {
          image: true,
        },
      });

      return {
        message: 'Service updated successfully',
        data: service,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update service: ${error.message}`,
      );
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
