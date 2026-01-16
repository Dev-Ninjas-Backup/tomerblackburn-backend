import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBathroomTypeCostCodeDto } from './dto/create-bathroom-type-cost-code.dto';
import { UpdateBathroomTypeCostCodeDto } from './dto/update-bathroom-type-cost-code.dto';
import { BulkAssignCostCodesDto } from './dto/bulk-assign-cost-codes.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class BathroomTypeCostCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateBathroomTypeCostCodeDto) {
    try {
      const bathroomType = await this.prisma.bathroomType.findUnique({
        where: { id: createDto.bathroomTypeId },
      });
      if (!bathroomType) {
        throw new NotFoundException(
          `Bathroom type with ID ${createDto.bathroomTypeId} not found`,
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

      const existing = await this.prisma.bathroomTypeCostCode.findFirst({
        where: {
          bathroomTypeId: createDto.bathroomTypeId,
          costCodeId: createDto.costCodeId,
        },
      });

      if (existing) {
        throw new ConflictException(
          'This cost code is already assigned to this bathroom type',
        );
      }

      const assignment = await this.prisma.bathroomTypeCostCode.create({
        data: createDto,
        include: {
          bathroomType: true,
          costCode: {
            include: {
              category: true,
              options: true,
            },
          },
        },
      });

      return {
        message: 'Cost code assigned to bathroom type successfully',
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
        `Failed to create bathroom type cost code assignment: ${error.message}`,
      );
    }
  }

  async bulkAssign(bulkAssignDto: BulkAssignCostCodesDto) {
    try {
      const { bathroomTypeId, costCodeIds, isIncludedInBase, isRequired } =
        bulkAssignDto;

      const bathroomType = await this.prisma.bathroomType.findUnique({
        where: { id: bathroomTypeId },
      });
      if (!bathroomType) {
        throw new NotFoundException(
          `Bathroom type with ID ${bathroomTypeId} not found`,
        );
      }

      const costCodes = await this.prisma.costCode.findMany({
        where: { id: { in: costCodeIds } },
      });
      if (costCodes.length !== costCodeIds.length) {
        throw new NotFoundException('One or more cost codes not found');
      }

      const assignments = [];
      for (const costCodeId of costCodeIds) {
        const existing = await this.prisma.bathroomTypeCostCode.findFirst({
          where: { bathroomTypeId, costCodeId },
        });

        if (!existing) {
          const assignment = await this.prisma.bathroomTypeCostCode.create({
            data: {
              bathroomTypeId,
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
        message: `Successfully assigned ${assignments.length} cost code(s) to bathroom type`,
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
      const bathroomTypes = await this.prisma.bathroomType.findMany();

      const bathroomTypeMap: Record<string, string> = {};
      bathroomTypes.forEach((bt) => {
        bathroomTypeMap[bt.code.toUpperCase()] = bt.id;
      });

      const costCodes = await this.prisma.costCode.findMany({
        where: { isActive: true },
      });

      const assignments = [];

      for (const costCode of costCodes) {
        // Apply to all bathroom types by default
        // Note: The old appliesToFp, appliesToTps, appliesToTpt, appliesToTp fields
        // no longer exist in the schema. This sync now applies to all bathroom types.
        const applicableTo = Object.values(bathroomTypeMap);

        for (const bathroomTypeId of applicableTo) {
          const existing = await this.prisma.bathroomTypeCostCode.findFirst({
            where: {
              bathroomTypeId,
              costCodeId: costCode.id,
            },
          });

          if (!existing) {
            const assignment = await this.prisma.bathroomTypeCostCode.create({
              data: {
                bathroomTypeId,
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
        `Failed to sync cost codes from bathroom types: ${error.message}`,
      );
    }
  }

  async findAll(bathroomTypeId?: string, costCodeId?: string) {
    try {
      const where: any = {};
      if (bathroomTypeId) where.bathroomTypeId = bathroomTypeId;
      if (costCodeId) where.costCodeId = costCodeId;

      const assignments = await this.prisma.bathroomTypeCostCode.findMany({
        where,
        include: {
          bathroomType: true,
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
          { bathroomType: { displayOrder: 'asc' } },
          { costCode: { code: 'asc' } },
        ],
      });

      return {
        message:
          assignments.length > 0
            ? 'Bathroom type cost code assignments retrieved successfully'
            : 'No assignments found',
        count: assignments.length,
        data: assignments,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve assignments: ${error.message}`);
    }
  }

  async findByBathroomType(bathroomTypeId: string, includeOptions = false) {
    try {
      const bathroomType = await this.prisma.bathroomType.findUnique({
        where: { id: bathroomTypeId },
      });

      if (!bathroomType) {
        throw new NotFoundException(
          `Bathroom type with ID ${bathroomTypeId} not found`,
        );
      }

      const costCodes = await this.prisma.bathroomTypeCostCode.findMany({
        where: { bathroomTypeId },
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
            ? 'Cost codes for bathroom type retrieved successfully'
            : 'No cost codes found for this bathroom type',
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve cost codes by bathroom type: ${error.message}`,
      );
    }
  }

  async findGroupedByCategory(bathroomTypeId: string) {
    try {
      const result = await this.findByBathroomType(bathroomTypeId, true);
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
            : 'No cost codes found for this bathroom type',
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

      const bathroomTypes = await this.prisma.bathroomTypeCostCode.findMany({
        where: { costCodeId },
        include: {
          bathroomType: true,
          costCode: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { bathroomType: { displayOrder: 'asc' } },
      });

      return {
        message:
          bathroomTypes.length > 0
            ? 'Bathroom types for cost code retrieved successfully'
            : 'No bathroom types found for this cost code',
        count: bathroomTypes.length,
        data: bathroomTypes,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve bathroom types by cost code: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const assignment = await this.prisma.bathroomTypeCostCode.findUnique({
        where: { id },
        include: {
          bathroomType: true,
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

  async update(id: string, updateDto: UpdateBathroomTypeCostCodeDto) {
    try {
      await this.findOne(id);

      const updated = await this.prisma.bathroomTypeCostCode.update({
        where: { id },
        data: updateDto,
        include: {
          bathroomType: true,
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

      await this.prisma.bathroomTypeCostCode.delete({
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

  async removeByIds(bathroomTypeId: string, costCodeId: string) {
    try {
      const assignment = await this.prisma.bathroomTypeCostCode.findFirst({
        where: {
          bathroomTypeId,
          costCodeId,
        },
      });

      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      await this.prisma.bathroomTypeCostCode.delete({
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
