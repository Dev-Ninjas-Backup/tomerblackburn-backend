import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    try {
      // Validate that serviceTypeId exists
      const serviceType = await this.prisma.serviceType.findUnique({
        where: { id: createServiceCategoryDto.serviceTypeId },
      });

      if (!serviceType) {
        throw new NotFoundException(
          `Service type with ID ${createServiceCategoryDto.serviceTypeId} not found`,
        );
      }

      // Check for duplicate name within the same service type
      const existingCategory = await this.prisma.serviceCategory.findFirst({
        where: {
          name: createServiceCategoryDto.name,
          serviceTypeId: createServiceCategoryDto.serviceTypeId,
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Service category with name "${createServiceCategoryDto.name}" already exists for this service type`,
        );
      }

      const serviceCategory = await this.prisma.serviceCategory.create({
        data: createServiceCategoryDto,
        include: {
          serviceType: true,
          services: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Service category created successfully',
        data: serviceCategory,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to create service category: ${error.message}`);
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const serviceCategories = await this.prisma.serviceCategory.findMany({
        where,
        include: {
          serviceType: true,
          services: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          serviceCategories.length > 0
            ? 'Service categories retrieved successfully'
            : 'No service categories found',
        count: serviceCategories.length,
        data: serviceCategories,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve service categories: ${error.message}`,
      );
    }
  }

  async findActive() {
    try {
      const serviceCategories = await this.prisma.serviceCategory.findMany({
        where: { isActive: true },
        include: {
          serviceType: true,
          services: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          serviceCategories.length > 0
            ? 'Active service categories retrieved successfully'
            : 'No active service categories found',
        count: serviceCategories.length,
        data: serviceCategories,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve active service categories: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const serviceCategory = await this.prisma.serviceCategory.findUnique({
        where: { id },
        include: {
          serviceType: true,
          services: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!serviceCategory) {
        throw new NotFoundException(`Service category with ID ${id} not found`);
      }

      return {
        message: 'Service category retrieved successfully',
        data: serviceCategory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve service category: ${error.message}`);
    }
  }

  async findByServiceType(serviceTypeId: string) {
    try {
      // Validate that serviceTypeId exists
      const serviceType = await this.prisma.serviceType.findUnique({
        where: { id: serviceTypeId },
      });

      if (!serviceType) {
        throw new NotFoundException(
          `Service type with ID ${serviceTypeId} not found`,
        );
      }

      const serviceCategories = await this.prisma.serviceCategory.findMany({
        where: { serviceTypeId },
        include: {
          serviceType: true,
          services: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          serviceCategories.length > 0
            ? `Service categories for service type "${serviceType.name}" retrieved successfully`
            : `No service categories found for service type "${serviceType.name}"`,
        count: serviceCategories.length,
        data: serviceCategories,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve service categories by service type: ${error.message}`,
      );
    }
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    try {
      // Check if service category exists
      await this.findOne(id);

      // If serviceTypeId is being updated, validate it exists
      if (updateServiceCategoryDto.serviceTypeId) {
        const serviceType = await this.prisma.serviceType.findUnique({
          where: { id: updateServiceCategoryDto.serviceTypeId },
        });

        if (!serviceType) {
          throw new NotFoundException(
            `Service type with ID ${updateServiceCategoryDto.serviceTypeId} not found`,
          );
        }
      }

      // Check for duplicate name if name is being updated
      if (updateServiceCategoryDto.name) {
        const existingCategory = await this.prisma.serviceCategory.findFirst({
          where: {
            name: updateServiceCategoryDto.name,
            serviceTypeId:
              updateServiceCategoryDto.serviceTypeId ||
              (await this.prisma.serviceCategory.findUnique({ where: { id } }))
                ?.serviceTypeId,
          },
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException(
            `Service category with name "${updateServiceCategoryDto.name}" already exists for this service type`,
          );
        }
      }

      const serviceCategory = await this.prisma.serviceCategory.update({
        where: { id },
        data: updateServiceCategoryDto,
        include: {
          serviceType: true,
          services: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Service category updated successfully',
        data: serviceCategory,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update service category: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      // Check if service category exists
      await this.findOne(id);

      // Check if there are associated services
      const serviceCount = await this.prisma.service.count({
        where: { serviceCategoryId: id },
      });

      if (serviceCount > 0) {
        throw new ConflictException(
          `Cannot delete service category with existing services. Found ${serviceCount} service(s).`,
        );
      }

      await this.prisma.serviceCategory.delete({
        where: { id },
      });

      return {
        message: 'Service category deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete service category: ${error.message}`);
    }
  }
}
