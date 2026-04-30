import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCostCodeCategoryDto } from './dto/create-cost-code-category.dto';
import { UpdateCostCodeCategoryDto } from './dto/update-cost-code-category.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class CostCodeCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCostCodeCategoryDto: CreateCostCodeCategoryDto) {
    try {
      const existingSlug = await this.prisma.costCodeCategory.findUnique({
        where: { slug: createCostCodeCategoryDto.slug },
      });

      if (existingSlug) {
        throw new ConflictException(
          `Cost code category with slug ${createCostCodeCategoryDto.slug} already exists`,
        );
      }

      const category = await this.prisma.costCodeCategory.create({
        data: createCostCodeCategoryDto,
      });

      return {
        message: 'Cost code category created successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create cost code category: ${error.message}`);
    }
  }

  async findAll(isActive?: boolean, includeCostCodes = false) {
    try {
      const categories = await this.prisma.costCodeCategory.findMany({
        where: isActive !== undefined ? { isActive } : undefined,
        include: includeCostCodes
          ? {
              costCodes: {
                where: { isActive: true },
                orderBy: { code: 'asc' },
              },
            }
          : undefined,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          categories.length > 0
            ? 'Cost code categories retrieved successfully'
            : 'No cost code categories found',
        count: categories.length,
        data: categories,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve cost code categories: ${error.message}`,
      );
    }
  }

  async findActive(includeCostCodes = false) {
    try {
      const categories = await this.prisma.costCodeCategory.findMany({
        where: { isActive: true },
        include: includeCostCodes
          ? {
              costCodes: {
                where: { isActive: true },
                orderBy: { code: 'asc' },
              },
            }
          : undefined,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          categories.length > 0
            ? 'Active cost code categories retrieved successfully'
            : 'No active cost code categories found',
        count: categories.length,
        data: categories,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve active cost code categories: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.costCodeCategory.findUnique({
        where: { id },
        include: {
          costCodes: {
            include: {
              options: true,
              category: true,
            },
            orderBy: { code: 'asc' },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Cost code category with ID ${id} not found`,
        );
      }

      return {
        message: 'Cost code category retrieved successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve cost code category: ${error.message}`,
      );
    }
  }

  async findBySlug(slug: string) {
    try {
      const category = await this.prisma.costCodeCategory.findUnique({
        where: { slug },
        include: {
          costCodes: {
            where: { isActive: true },
            include: {
              options: {
                orderBy: { displayOrder: 'asc' },
              },
            },
            orderBy: { code: 'asc' },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Cost code category with slug ${slug} not found`,
        );
      }

      return {
        message: 'Cost code category retrieved successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve cost code category: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateCostCodeCategoryDto: UpdateCostCodeCategoryDto,
  ) {
    try {
      await this.findOne(id);

      if (updateCostCodeCategoryDto.slug) {
        const existingSlug = await this.prisma.costCodeCategory.findUnique({
          where: { slug: updateCostCodeCategoryDto.slug },
        });

        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(
            `Cost code category with slug ${updateCostCodeCategoryDto.slug} already exists`,
          );
        }
      }

      const category = await this.prisma.costCodeCategory.update({
        where: { id },
        data: updateCostCodeCategoryDto,
      });

      return {
        message: 'Cost code category updated successfully',
        data: category,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update cost code category: ${error.message}`);
    }
  }

  async toggleStatus(id: string) {
    try {
      const result = await this.findOne(id);
      const category = result.data;

      const updated = await this.prisma.costCodeCategory.update({
        where: { id },
        data: { isActive: !category.isActive },
      });

      return {
        message: 'Category status toggled successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to toggle category status: ${error.message}`);
    }
  }

  async reorder(items: { id: string; displayOrder: number }[]) {
    try {
      await this.prisma.$transaction(
        items.map(({ id, displayOrder }) =>
          this.prisma.costCodeCategory.update({
            where: { id },
            data: { displayOrder },
          }),
        ),
      );
      return { message: 'Categories reordered successfully' };
    } catch (error) {
      throw new Error(`Failed to reorder categories: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const costCodeCount = await this.prisma.costCode.count({
        where: { categoryId: id },
      });

      if (costCodeCount > 0) {
        throw new ConflictException(
          `Cannot delete category with existing cost codes. Found ${costCodeCount} cost code(s).`,
        );
      }

      await this.prisma.costCodeCategory.delete({
        where: { id },
      });

      return {
        message: 'Cost code category deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete cost code category: ${error.message}`);
    }
  }
}
