import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCostCodeDto } from './dto/create-cost-code.dto';
import { UpdateCostCodeDto } from './dto/update-cost-code.dto';
import { CostCodeFilterDto } from './dto/cost-code-filter.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class CostCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCostCodeDto: CreateCostCodeDto) {
    try {
      const existingCode = await this.prisma.costCode.findUnique({
        where: { code: createCostCodeDto.code },
      });

      if (existingCode) {
        throw new ConflictException(
          `Cost code with code ${createCostCodeDto.code} already exists`,
        );
      }

      const categoryExists = await this.prisma.costCodeCategory.findUnique({
        where: { id: createCostCodeDto.categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException(
          `Category with ID ${createCostCodeDto.categoryId} not found`,
        );
      }

      const costCode = await this.prisma.costCode.create({
        data: createCostCodeDto,
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Cost code created successfully',
        data: costCode,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(`Failed to create cost code: ${error.message}`);
    }
  }

  async findAll(filterDto: CostCodeFilterDto) {
    try {
      const {
        categoryId,
        colorTag,
        isActive,
        calculationType,
        includeOptions,
        includeCategory,
      } = filterDto;

      const where: any = {};

      if (categoryId) where.categoryId = categoryId;
      if (colorTag) where.colorTag = colorTag;
      if (isActive !== undefined) where.isActive = isActive;
      if (calculationType) where.calculationType = calculationType;

      const costCodes = await this.prisma.costCode.findMany({
        where,
        include: {
          category: includeCategory,
          options: includeOptions
            ? {
                orderBy: { displayOrder: 'asc' },
              }
            : false,
        },
        orderBy: { code: 'asc' },
      });

      return {
        message:
          costCodes.length > 0
            ? 'Cost codes retrieved successfully'
            : 'No cost codes found',
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve cost codes: ${error.message}`);
    }
  }

  async findByCategory(categoryId: string) {
    try {
      const costCodes = await this.prisma.costCode.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { code: 'asc' },
      });

      return {
        message:
          costCodes.length > 0
            ? 'Cost codes retrieved successfully'
            : 'No cost codes found in this category',
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve cost codes by category: ${error.message}`,
      );
    }
  }

  async findByBathroomType(bathroomTypeCode: string, includeOptions = true) {
    try {
      const codeUpper = bathroomTypeCode.toUpperCase();
      const fieldMap: Record<string, string> = {
        FP: 'appliesToFp',
        TPS: 'appliesToTps',
        TPT: 'appliesToTpt',
        TP: 'appliesToTp',
      };

      const field = fieldMap[codeUpper];
      if (!field) {
        throw new NotFoundException(
          `Invalid bathroom type code: ${bathroomTypeCode}`,
        );
      }

      const costCodes = await this.prisma.costCode.findMany({
        where: {
          [field]: true,
          isActive: true,
        },
        include: {
          category: true,
          options: includeOptions
            ? {
                orderBy: { displayOrder: 'asc' },
              }
            : false,
        },
        orderBy: [{ category: { displayOrder: 'asc' } }, { code: 'asc' }],
      });

      return {
        message:
          costCodes.length > 0
            ? `Cost codes for ${codeUpper} retrieved successfully`
            : `No cost codes found for bathroom type ${codeUpper}`,
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

  async findByColorTag(colorTag: string) {
    try {
      const costCodes = await this.prisma.costCode.findMany({
        where: {
          colorTag,
          isActive: true,
        },
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { code: 'asc' },
      });

      return {
        message:
          costCodes.length > 0
            ? `Cost codes with ${colorTag} color tag retrieved successfully`
            : `No cost codes found with ${colorTag} color tag`,
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve cost codes by color tag: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const costCode = await this.prisma.costCode.findUnique({
        where: { id },
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!costCode) {
        throw new NotFoundException(`Cost code with ID ${id} not found`);
      }

      return {
        message: 'Cost code retrieved successfully',
        data: costCode,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve cost code: ${error.message}`);
    }
  }

  async findByCode(code: string) {
    try {
      const costCode = await this.prisma.costCode.findUnique({
        where: { code },
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!costCode) {
        throw new NotFoundException(`Cost code with code ${code} not found`);
      }

      return {
        message: 'Cost code retrieved successfully',
        data: costCode,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve cost code: ${error.message}`);
    }
  }

  async update(id: string, updateCostCodeDto: UpdateCostCodeDto) {
    try {
      await this.findOne(id);

      if (updateCostCodeDto.code) {
        const existingCode = await this.prisma.costCode.findUnique({
          where: { code: updateCostCodeDto.code },
        });

        if (existingCode && existingCode.id !== id) {
          throw new ConflictException(
            `Cost code with code ${updateCostCodeDto.code} already exists`,
          );
        }
      }

      if (updateCostCodeDto.categoryId) {
        const categoryExists = await this.prisma.costCodeCategory.findUnique({
          where: { id: updateCostCodeDto.categoryId },
        });

        if (!categoryExists) {
          throw new NotFoundException(
            `Category with ID ${updateCostCodeDto.categoryId} not found`,
          );
        }
      }

      const costCode = await this.prisma.costCode.update({
        where: { id },
        data: updateCostCodeDto,
        include: {
          category: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Cost code updated successfully',
        data: costCode,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update cost code: ${error.message}`);
    }
  }

  async toggleStatus(id: string) {
    try {
      const result = await this.findOne(id);
      const costCode = result.data;

      const updated = await this.prisma.costCode.update({
        where: { id },
        data: { isActive: !costCode.isActive },
        include: {
          category: true,
          options: true,
        },
      });

      return {
        message: 'Cost code status toggled successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to toggle cost code status: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const submissionItemCount = await this.prisma.submissionItem.count({
        where: { costCodeId: id },
      });

      if (submissionItemCount > 0) {
        throw new ConflictException(
          `Cannot delete cost code with existing submission items. Found ${submissionItemCount} item(s).`,
        );
      }

      await this.prisma.costCode.delete({
        where: { id },
      });

      return {
        message: 'Cost code deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete cost code: ${error.message}`);
    }
  }
}
