import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreatePortfolioCategoryDto,
  CreatePortfolioImageDto,
} from './dto/create-portfolio.dto';
import {
  UpdatePortfolioCategoryDto,
  UpdatePortfolioImageDto,
} from './dto/update-portfolio.dto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  // Category methods
  async createCategory(createDto: CreatePortfolioCategoryDto) {
    try {
      const existingCategory = await this.prisma.portfolioCategory.findUnique({
        where: { slug: createDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Portfolio category with slug ${createDto.slug} already exists`,
        );
      }

      const { images, ...categoryData } = createDto;

      const category = await this.prisma.portfolioCategory.create({
        data: {
          ...categoryData,
          images: images
            ? {
                create: images.map((img) => ({
                  fileId: img.fileId,
                  caption: img.caption,
                  displayOrder: img.displayOrder ?? 0,
                })),
              }
            : undefined,
        },
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Portfolio category created successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create portfolio category: ${error.message}`);
    }
  }

  async findAllCategories(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };

      const categories = await this.prisma.portfolioCategory.findMany({
        where,
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      return {
        message:
          categories.length > 0
            ? 'Portfolio categories retrieved successfully'
            : 'No portfolio categories found',
        count: categories.length,
        data: categories,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve portfolio categories: ${error.message}`,
      );
    }
  }

  async findCategoryById(id: string) {
    try {
      const category = await this.prisma.portfolioCategory.findUnique({
        where: { id },
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Portfolio category with ID ${id} not found`,
        );
      }

      return {
        message: 'Portfolio category retrieved successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve portfolio category: ${error.message}`,
      );
    }
  }

  async findCategoryBySlug(slug: string) {
    try {
      const category = await this.prisma.portfolioCategory.findUnique({
        where: { slug },
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(
          `Portfolio category with slug ${slug} not found`,
        );
      }

      return {
        message: 'Portfolio category retrieved successfully',
        data: category,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve portfolio category: ${error.message}`,
      );
    }
  }

  async updateCategory(id: string, updateDto: UpdatePortfolioCategoryDto) {
    try {
      await this.findCategoryById(id);

      if (updateDto.slug) {
        const existingCategory = await this.prisma.portfolioCategory.findUnique(
          {
            where: { slug: updateDto.slug },
          },
        );

        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException(
            `Portfolio category with slug ${updateDto.slug} already exists`,
          );
        }
      }

      const category = await this.prisma.portfolioCategory.update({
        where: { id },
        data: updateDto,
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Portfolio category updated successfully',
        data: category,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update portfolio category: ${error.message}`);
    }
  }

  async toggleCategoryStatus(id: string) {
    try {
      const result = await this.findCategoryById(id);
      const category = result.data;

      const updated = await this.prisma.portfolioCategory.update({
        where: { id },
        data: { isActive: !category.isActive },
        include: {
          images: {
            include: { file: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return {
        message: 'Portfolio category status toggled successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to toggle portfolio category status: ${error.message}`,
      );
    }
  }

  async removeCategory(id: string) {
    try {
      await this.findCategoryById(id);

      await this.prisma.portfolioCategory.delete({
        where: { id },
      });

      return {
        message: 'Portfolio category deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete portfolio category: ${error.message}`);
    }
  }

  // Image methods
  async addImage(categoryId: string, createDto: CreatePortfolioImageDto) {
    try {
      await this.findCategoryById(categoryId);

      const image = await this.prisma.portfolioImage.create({
        data: {
          categoryId,
          fileId: createDto.fileId,
          caption: createDto.caption,
          displayOrder: createDto.displayOrder ?? 0,
        },
        include: {
          file: true,
        },
      });

      return {
        message: 'Portfolio image added successfully',
        data: image,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to add portfolio image: ${error.message}`);
    }
  }

  async updateImage(imageId: string, updateDto: UpdatePortfolioImageDto) {
    try {
      const image = await this.prisma.portfolioImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundException(
          `Portfolio image with ID ${imageId} not found`,
        );
      }

      const updated = await this.prisma.portfolioImage.update({
        where: { id: imageId },
        data: updateDto,
        include: {
          file: true,
        },
      });

      return {
        message: 'Portfolio image updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update portfolio image: ${error.message}`);
    }
  }

  async removeImage(imageId: string) {
    try {
      const image = await this.prisma.portfolioImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundException(
          `Portfolio image with ID ${imageId} not found`,
        );
      }

      await this.prisma.portfolioImage.delete({
        where: { id: imageId },
      });

      return {
        message: 'Portfolio image deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete portfolio image: ${error.message}`);
    }
  }

  async reorderImages(categoryId: string, imageIds: string[]) {
    try {
      await this.findCategoryById(categoryId);

      const updates = imageIds.map((id, index) =>
        this.prisma.portfolioImage.update({
          where: { id },
          data: { displayOrder: index },
        }),
      );

      await this.prisma.$transaction(updates);

      return {
        message: 'Portfolio images reordered successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to reorder portfolio images: ${error.message}`);
    }
  }
}
