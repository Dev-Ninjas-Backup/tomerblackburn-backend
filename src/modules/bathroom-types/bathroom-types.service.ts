import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBathroomTypeDto } from './dto/create-bathroom-type.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateBathroomTypeDto } from './dto/update-bathroom-type.dto';

@Injectable()
export class BathroomTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBathroomTypeDto: CreateBathroomTypeDto) {
    try {
      const existingCode = await this.prisma.bathroomType.findUnique({
        where: { code: createBathroomTypeDto.code },
      });

      if (existingCode) {
        throw new ConflictException(
          `Bathroom type with code ${createBathroomTypeDto.code} already exists`,
        );
      }

      const bathroomType = await this.prisma.bathroomType.create({
        data: createBathroomTypeDto,
        include: {
          imageFile: true,
        },
      });

      return {
        message: 'Bathroom type created successfully',
        data: bathroomType,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create bathroom type: ${error.message}`);
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const bathroomTypes = await this.prisma.bathroomType.findMany({
        where: isActive !== undefined ? { isActive } : undefined,
        include: {
          imageFile: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          bathroomTypes.length > 0
            ? 'Bathroom types retrieved successfully'
            : 'No bathroom types found',
        count: bathroomTypes.length,
        data: bathroomTypes,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve bathroom types: ${error.message}`);
    }
  }

  async findActive() {
    try {
      const bathroomTypes = await this.prisma.bathroomType.findMany({
        where: { isActive: true },
        include: {
          imageFile: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      });

      return {
        message:
          bathroomTypes.length > 0
            ? 'Active bathroom types retrieved successfully'
            : 'No active bathroom types found',
        count: bathroomTypes.length,
        data: bathroomTypes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve active bathroom types: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const bathroomType = await this.prisma.bathroomType.findUnique({
        where: { id },
        include: {
          imageFile: true,
          bathroomTypeCostCodes: {
            include: {
              costCode: {
                include: {
                  category: true,
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!bathroomType) {
        throw new NotFoundException(`Bathroom type with ID ${id} not found`);
      }

      return {
        message: 'Bathroom type retrieved successfully',
        data: bathroomType,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve bathroom type: ${error.message}`);
    }
  }

  async findByCode(code: string) {
    try {
      const bathroomType = await this.prisma.bathroomType.findUnique({
        where: { code },
        include: {
          imageFile: true,
          bathroomTypeCostCodes: {
            include: {
              costCode: {
                include: {
                  category: true,
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!bathroomType) {
        throw new NotFoundException(
          `Bathroom type with code ${code} not found`,
        );
      }

      return {
        message: 'Bathroom type retrieved successfully',
        data: bathroomType,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve bathroom type: ${error.message}`);
    }
  }

  async update(id: string, updateBathroomTypeDto: UpdateBathroomTypeDto) {
    try {
      await this.findOne(id);

      if (updateBathroomTypeDto.code) {
        const existingCode = await this.prisma.bathroomType.findUnique({
          where: { code: updateBathroomTypeDto.code },
        });

        if (existingCode && existingCode.id !== id) {
          throw new ConflictException(
            `Bathroom type with code ${updateBathroomTypeDto.code} already exists`,
          );
        }
      }

      const bathroomType = await this.prisma.bathroomType.update({
        where: { id },
        data: updateBathroomTypeDto,
        include: {
          imageFile: true,
        },
      });

      return {
        message: 'Bathroom type updated successfully',
        data: bathroomType,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update bathroom type: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const submissionCount = await this.prisma.submission.count({
        where: { bathroomTypeId: id },
      });

      if (submissionCount > 0) {
        throw new ConflictException(
          `Cannot delete bathroom type with existing submissions. Found ${submissionCount} submission(s).`,
        );
      }

      await this.prisma.bathroomType.delete({
        where: { id },
      });

      return {
        message: 'Bathroom type deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete bathroom type: ${error.message}`);
    }
  }
}
