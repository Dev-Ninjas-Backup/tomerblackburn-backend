import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ServiceTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceTypeDto: CreateServiceTypeDto) {
    try {
      // Check for duplicate name
      const existingServiceType = await this.prisma.serviceType.findFirst({
        where: { name: createServiceTypeDto.name },
      });

      if (existingServiceType) {
        throw new ConflictException(
          `Service type with name "${createServiceTypeDto.name}" already exists`,
        );
      }

      const serviceType = await this.prisma.serviceType.create({
        data: createServiceTypeDto,
        include: {
          serviceCategories: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Service type created successfully',
        data: serviceType,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create service type: ${error.message}`);
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const serviceTypes = await this.prisma.serviceType.findMany({
        where,
        include: {
          serviceCategories: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          serviceTypes.length > 0
            ? 'Service types retrieved successfully'
            : 'No service types found',
        count: serviceTypes.length,
        data: serviceTypes,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve service types: ${error.message}`);
    }
  }

  async findActive() {
    try {
      const serviceTypes = await this.prisma.serviceType.findMany({
        where: { isActive: true },
        include: {
          serviceCategories: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          serviceTypes.length > 0
            ? 'Active service types retrieved successfully'
            : 'No active service types found',
        count: serviceTypes.length,
        data: serviceTypes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve active service types: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const serviceType = await this.prisma.serviceType.findUnique({
        where: { id },
        include: {
          serviceCategories: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!serviceType) {
        throw new NotFoundException(`Service type with ID ${id} not found`);
      }

      return {
        message: 'Service type retrieved successfully',
        data: serviceType,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve service type: ${error.message}`);
    }
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto) {
    try {
      // Check if service type exists
      await this.findOne(id);

      // Check for duplicate name if name is being updated
      if (updateServiceTypeDto.name) {
        const existingServiceType = await this.prisma.serviceType.findFirst({
          where: { name: updateServiceTypeDto.name },
        });

        if (existingServiceType && existingServiceType.id !== id) {
          throw new ConflictException(
            `Service type with name "${updateServiceTypeDto.name}" already exists`,
          );
        }
      }

      const serviceType = await this.prisma.serviceType.update({
        where: { id },
        data: updateServiceTypeDto,
        include: {
          serviceCategories: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Service type updated successfully',
        data: serviceType,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update service type: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      // Check if service type exists
      await this.findOne(id);

      // Check if there are associated service categories
      const categoryCount = await this.prisma.serviceCategory.count({
        where: { serviceTypeId: id },
      });

      if (categoryCount > 0) {
        throw new ConflictException(
          `Cannot delete service type with existing service categories. Found ${categoryCount} category(ies).`,
        );
      }

      await this.prisma.serviceType.delete({
        where: { id },
      });

      return {
        message: 'Service type deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete service type: ${error.message}`);
    }
  }
}
