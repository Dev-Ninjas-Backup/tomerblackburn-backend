import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCostCodeOptionDto } from './dto/create-cost-code-option.dto';
import { UpdateCostCodeOptionDto } from './dto/update-cost-code-option.dto';
import { BulkCreateCostCodeOptionsDto } from './dto/bulk-create-cost-code-options.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class CostCodeOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCostCodeOptionDto: CreateCostCodeOptionDto) {
    try {
      const costCodeExists = await this.prisma.costCode.findUnique({
        where: { id: createCostCodeOptionDto.costCodeId },
      });

      if (!costCodeExists) {
        throw new NotFoundException(
          `Cost code with ID ${createCostCodeOptionDto.costCodeId} not found`,
        );
      }

      const option = await this.prisma.costCodeOption.create({
        data: {
          ...createCostCodeOptionDto,
        },
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        message: 'Cost code option created successfully',
        data: option,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to create cost code option: ${error.message}`);
    }
  }

  async bulkCreate(bulkCreateDto: BulkCreateCostCodeOptionsDto) {
    try {
      const { costCodeId, options } = bulkCreateDto;

      const costCode = await this.prisma.costCode.findUnique({
        where: { id: costCodeId },
      });

      if (!costCode) {
        throw new NotFoundException(
          `Cost code with ID ${costCodeId} not found`,
        );
      }

      const basePrice = Number(costCode.basePrice);

      const optionsToCreate = options.map((option, index) => ({
        costCodeId,
        optionName: option.optionName,
        optionValue: option.optionValue,
        priceModifier: option.priceModifier || 0,
        isDefault: option.isDefault || false,
        displayOrder: option.displayOrder ?? index,
      }));

      await this.prisma.costCodeOption.createMany({
        data: optionsToCreate,
      });

      return this.findByCostCode(costCodeId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to bulk create cost code options: ${error.message}`,
      );
    }
  }

  async findAll(costCodeId?: string) {
    try {
      const options = await this.prisma.costCodeOption.findMany({
        where: costCodeId ? { costCodeId } : undefined,
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [{ costCodeId: 'asc' }, { displayOrder: 'asc' }],
      });

      return {
        message:
          options.length > 0
            ? 'Cost code options retrieved successfully'
            : 'No cost code options found',
        count: options.length,
        data: options,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve cost code options: ${error.message}`);
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

      const options = await this.prisma.costCodeOption.findMany({
        where: { costCodeId },
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      return {
        message:
          options.length > 0
            ? 'Cost code options retrieved successfully'
            : 'No options found for this cost code',
        count: options.length,
        data: options,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve cost code options: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const option = await this.prisma.costCodeOption.findUnique({
        where: { id },
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!option) {
        throw new NotFoundException(`Cost code option with ID ${id} not found`);
      }

      return {
        message: 'Cost code option retrieved successfully',
        data: option,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve cost code option: ${error.message}`);
    }
  }

  async update(id: string, updateCostCodeOptionDto: UpdateCostCodeOptionDto) {
    try {
      await this.findOne(id);

      const updated = await this.prisma.costCodeOption.update({
        where: { id },
        data: {
          ...updateCostCodeOptionDto,
        },
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        message: 'Cost code option updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update cost code option: ${error.message}`);
    }
  }

  async setAsDefault(id: string) {
    try {
      const result = await this.findOne(id);
      const option = result.data;

      await this.prisma.costCodeOption.updateMany({
        where: {
          costCodeId: option.costCodeId,
          id: { not: id },
        },
        data: { isDefault: false },
      });

      const updated = await this.prisma.costCodeOption.update({
        where: { id },
        data: { isDefault: true },
        include: {
          costCode: {
            include: {
              category: true,
            },
          },
        },
      });

      return {
        message: 'Option set as default successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to set option as default: ${error.message}`);
    }
  }

  async reorderOptions(costCodeId: string, optionIds: string[]) {
    try {
      const options = await this.prisma.costCodeOption.findMany({
        where: { costCodeId },
      });

      if (options.length !== optionIds.length) {
        throw new BadRequestException(
          'Option IDs count does not match existing options count',
        );
      }

      const optionIdsSet = new Set(options.map((o) => o.id));
      for (const id of optionIds) {
        if (!optionIdsSet.has(id)) {
          throw new BadRequestException(
            `Option ID ${id} does not belong to this cost code`,
          );
        }
      }

      await this.prisma.$transaction(
        optionIds.map((id, index) =>
          this.prisma.costCodeOption.update({
            where: { id },
            data: { displayOrder: index },
          }),
        ),
      );

      return this.findByCostCode(costCodeId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to reorder options: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const submissionItemCount = await this.prisma.submissionItem.count({
        where: { selectedOptionId: id },
      });

      if (submissionItemCount > 0) {
        throw new ConflictException(
          `Cannot delete option used in ${submissionItemCount} submission(s)`,
        );
      }

      await this.prisma.costCodeOption.delete({
        where: { id },
      });

      return {
        message: 'Cost code option deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete cost code option: ${error.message}`);
    }
  }
}
