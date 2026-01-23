import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateServiceCostCodeDto } from './dto/create-service-cost-code.dto';
import { UpdateServiceCostCodeDto } from './dto/update-service-cost-code.dto';
import { BulkAssignCostCodesDto } from './dto/bulk-assign-cost-codes.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ServiceCostCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateServiceCostCodeDto) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id: createDto.serviceId },
      });
      if (!service) {
        throw new NotFoundException(
          `Service with ID ${createDto.serviceId} not found`,
        );
      }

      const costCode = await this.prisma.costCode.findUnique({
        where: { id: createDto.costCodeId },
      });
      if (!costCode) {
        throw new NotFoundException(
          `Cost code with ID ${createDto.costCodeId} not found`,
        );
      }

      const existing = await this.prisma.serviceCostCode.findFirst({
        where: {
          serviceId: createDto.serviceId,
          costCodeId: createDto.costCodeId,
        },
      });

      if (existing) {
        throw new ConflictException(
          'This cost code is already assigned to this service',
        );
      }

      const assignment = await this.prisma.serviceCostCode.create({
        data: createDto,
        include: {
          service: true,
          costCode: {
            include: {
              category: true,
              options: true,
            },
          },
        },
      });

      return {
        message: 'Cost code assigned to service successfully',
        data: assignment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(
        `Failed to create service cost code assignment: ${error.message}`,
      );
    }
  }

  async bulkAssign(bulkAssignDto: BulkAssignCostCodesDto) {
    try {
      const { serviceId, costCodeIds, isIncludedInBase, isRequired } =
        bulkAssignDto;

      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      const costCodes = await this.prisma.costCode.findMany({
        where: { id: { in: costCodeIds } },
      });
      if (costCodes.length !== costCodeIds.length) {
        throw new NotFoundException('One or more cost codes not found');
      }

      const assignments = [];
      for (const costCodeId of costCodeIds) {
        const existing = await this.prisma.serviceCostCode.findFirst({
          where: { serviceId, costCodeId },
        });

        if (!existing) {
          const assignment = await this.prisma.serviceCostCode.create({
            data: {
              serviceId,
              costCodeId,
              isIncludedInBase: isIncludedInBase ?? true,
              isRequired: isRequired ?? false,
            },
            include: {
              costCode: {
                include: {
                  category: true,
                },
              },
            },
          });
          assignments.push(assignment);
        }
      }

      return {
        message: `Successfully assigned ${assignments.length} cost code(s) to service`,
        count: assignments.length,
        data: assignments,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to bulk assign cost codes: ${error.message}`);
    }
  }

  async syncFromCostCodes() {
    try {
      const services = await this.prisma.service.findMany();

      const serviceMap: Record<string, string> = {};
      services.forEach((service) => {
        serviceMap[service.code.toUpperCase()] = service.id;
      });

      const costCodes = await this.prisma.costCode.findMany({
        where: { isActive: true },
      });

      const assignments = [];

      for (const costCode of costCodes) {
        // Apply to all services by default
        // Note: The old appliesToFp, appliesToTps, appliesToTpt, appliesToTp fields
        // no longer exist in the schema. This sync now applies to all services.
        const applicableTo = Object.values(serviceMap);

        for (const serviceId of applicableTo) {
          const existing = await this.prisma.serviceCostCode.findFirst({
            where: {
              serviceId,
              costCodeId: costCode.id,
            },
          });

          if (!existing) {
            const assignment = await this.prisma.serviceCostCode.create({
              data: {
                serviceId,
                costCodeId: costCode.id,
                isIncludedInBase: costCode.questionType === 'WHITE',
                isRequired: false,
              },
            });
            assignments.push(assignment);
          }
        }
      }

      return {
        message: `Synced ${assignments.length} cost code assignment(s)`,
        count: assignments.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to sync cost codes from services: ${error.message}`,
      );
    }
  }

  async findAll(serviceId?: string, costCodeId?: string) {
    try {
      const where: any = {};
      if (serviceId) where.serviceId = serviceId;
      if (costCodeId) where.costCodeId = costCodeId;

      const assignments = await this.prisma.serviceCostCode.findMany({
        where,
        include: {
          service: true,
          costCode: {
            include: {
              category: true,
              options: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
        orderBy: [
          { service: { displayOrder: 'asc' } },
          { costCode: { code: 'asc' } },
        ],
      });

      return {
        message:
          assignments.length > 0
            ? 'Service cost code assignments retrieved successfully'
            : 'No assignments found',
        count: assignments.length,
        data: assignments,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve assignments: ${error.message}`);
    }
  }

  async findByService(serviceId: string, includeOptions = false) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      const costCodes = await this.prisma.serviceCostCode.findMany({
        where: { serviceId },
        include: {
          costCode: {
            include: {
              category: true,
              options: includeOptions
                ? {
                    orderBy: { displayOrder: 'asc' },
                  }
                : false,
            },
          },
        },
        orderBy: [
          { costCode: { category: { displayOrder: 'asc' } } },
          { costCode: { code: 'asc' } },
        ],
      });

      return {
        message:
          costCodes.length > 0
            ? 'Cost codes for service retrieved successfully'
            : 'No cost codes found for this service',
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve cost codes by service: ${error.message}`,
      );
    }
  }

  async findGroupedByCategory(serviceId: string) {
    try {
      const result = await this.findByService(serviceId, true);
      const assignments = result.data;

      const grouped: Record<string, any> = {};

      for (const assignment of assignments) {
        const category = assignment.costCode.category;
        if (!grouped[category.slug]) {
          grouped[category.slug] = {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
            displayOrder: category.displayOrder,
            costCodes: [],
          };
        }

        grouped[category.slug].costCodes.push({
          ...assignment.costCode,
          isIncludedInBase: assignment.isIncludedInBase,
          isRequired: assignment.isRequired,
          defaultQuantity: assignment.defaultQuantity,
        });
      }

      const groupedArray = Object.values(grouped).sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder,
      );

      return {
        message:
          groupedArray.length > 0
            ? 'Cost codes grouped by category retrieved successfully'
            : 'No cost codes found for this service',
        count: groupedArray.length,
        data: groupedArray,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve grouped cost codes: ${error.message}`,
      );
    }
  }

  async findByCostCode(costCodeId: string) {
    try {
      const costCode = await this.prisma.costCode.findUnique({
        where: { id: costCodeId },
      });

      if (!costCode) {
        throw new NotFoundException(
          `Cost code with ID ${costCodeId} not found`,
        );
      }

      const services = await this.prisma.serviceCostCode.findMany({
        where: { costCodeId },
        include: {
          service: true,
          costCode: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { service: { displayOrder: 'asc' } },
      });

      return {
        message:
          services.length > 0
            ? 'Services for cost code retrieved successfully'
            : 'No services found for this cost code',
        count: services.length,
        data: services,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve services by cost code: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const assignment = await this.prisma.serviceCostCode.findUnique({
        where: { id },
        include: {
          service: true,
          costCode: {
            include: {
              category: true,
              options: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${id} not found`);
      }

      return {
        message: 'Assignment retrieved successfully',
        data: assignment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve assignment: ${error.message}`);
    }
  }

  async update(id: string, updateDto: UpdateServiceCostCodeDto) {
    try {
      await this.findOne(id);

      const updated = await this.prisma.serviceCostCode.update({
        where: { id },
        data: updateDto,
        include: {
          service: true,
          costCode: {
            include: {
              category: true,
              options: true,
            },
          },
        },
      });

      return {
        message: 'Assignment updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update assignment: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.prisma.serviceCostCode.delete({
        where: { id },
      });

      return {
        message: 'Assignment removed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to remove assignment: ${error.message}`);
    }
  }

  async removeByIds(serviceId: string, costCodeId: string) {
    try {
      const assignment = await this.prisma.serviceCostCode.findFirst({
        where: {
          serviceId,
          costCodeId,
        },
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      await this.prisma.serviceCostCode.delete({
        where: { id: assignment.id },
      });

      return {
        message: 'Assignment removed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to remove assignment: ${error.message}`);
    }
  }
}
