import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCostCodeDto } from './dto/create-cost-code.dto';
import { UpdateCostCodeDto } from './dto/update-cost-code.dto';
import { CostCodeFilterDto } from './dto/cost-code-filter.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

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

      // Validate serviceId if provided
      if (createCostCodeDto.serviceId) {
        const serviceExists = await this.prisma.service.findUnique({
          where: { id: createCostCodeDto.serviceId },
        });

        if (!serviceExists) {
          throw new NotFoundException(
            `Service with ID ${createCostCodeDto.serviceId} not found`,
          );
        }
      }

      // Validate parentCostCodeId if provided
      if (createCostCodeDto.parentCostCodeId) {
        const parentExists = await this.prisma.costCode.findUnique({
          where: { id: createCostCodeDto.parentCostCodeId },
        });

        if (!parentExists) {
          throw new NotFoundException(
            `Parent cost code with ID ${createCostCodeDto.parentCostCodeId} not found`,
          );
        }
      }

      // Auto-calculate clientPrice from basePrice + markup if not provided
      const basePrice = createCostCodeDto.basePrice ?? 0;
      const markup = createCostCodeDto.markup ?? 0;
      const clientPrice =
        createCostCodeDto.clientPrice ?? basePrice * (1 + markup / 100);

      const costCode = await this.prisma.costCode.create({
        data: {
          ...createCostCodeDto,
          markup,
          clientPrice,
        },
        include: {
          category: true,
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
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
        serviceId,
        questionType,
        unitType,
        isActive,
        isIncludedInBase,
        includeOptions,
        includeCategory,
        includeServiceRelation,
      } = filterDto;

      const where: any = {};

      if (categoryId) where.categoryId = categoryId;
      if (serviceId) where.serviceId = serviceId;
      if (questionType) where.questionType = questionType;
      if (unitType) where.unitType = unitType;
      if (isActive !== undefined) where.isActive = isActive;
      if (isIncludedInBase !== undefined)
        where.isIncludedInBase = isIncludedInBase;

      const costCodes = await this.prisma.costCode.findMany({
        where,
        include: {
          category: includeCategory,
          service: includeServiceRelation,
          options: includeOptions
            ? {
                orderBy: { displayOrder: 'asc' },
              }
            : false,
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
          images: {
            include: { fileInstance: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
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
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
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

  async findByBathroomType(bathroomTypeId: string, includeOptions = true) {
    try {
      // Find service cost codes via junction table
      const serviceCostCodes = await this.prisma.serviceCostCode.findMany({
        where: {
          serviceId: bathroomTypeId,
          isVisible: true,
          costCode: {
            isActive: true,
          },
        },
        include: {
          costCode: {
            include: {
              category: true,
              service: true,
              options: includeOptions
                ? {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' },
                  }
                : false,
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }],
      });

      const costCodes = serviceCostCodes.map((scc) => ({
        ...scc.costCode,
        // Include junction table overrides
        isIncludedInBase: scc.isIncludedInBase,
        isRequired: scc.isRequired,
        defaultQuantity: scc.defaultQuantity,
        priceOverride: scc.priceOverride,
        displayOrder: scc.displayOrder,
      }));

      return {
        message:
          costCodes.length > 0
            ? 'Cost codes for service retrieved successfully'
            : 'No cost codes found for this service',
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve cost codes by service: ${error.message}`,
      );
    }
  }

  async findByQuestionType(questionType: string) {
    try {
      const costCodes = await this.prisma.costCode.findMany({
        where: {
          questionType: questionType as any,
          isActive: true,
        },
        include: {
          category: true,
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
      });

      return {
        message:
          costCodes.length > 0
            ? `Cost codes with ${questionType} question type retrieved successfully`
            : `No cost codes found with ${questionType} question type`,
        count: costCodes.length,
        data: costCodes,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve cost codes by question type: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const costCode = await this.prisma.costCode.findUnique({
        where: { id },
        include: {
          category: true,
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          serviceCostCodes: {
            include: {
              service: true,
            },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
          images: {
            include: { fileInstance: true },
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
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
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

      // Validate serviceId if being updated
      if (updateCostCodeDto.serviceId) {
        const serviceExists = await this.prisma.service.findUnique({
          where: { id: updateCostCodeDto.serviceId },
        });

        if (!serviceExists) {
          throw new NotFoundException(
            `Service with ID ${updateCostCodeDto.serviceId} not found`,
          );
        }
      }

      // Auto-calculate clientPrice if markup or basePrice changed
      const updateData: any = { ...updateCostCodeDto };

      // Validate parentCostCodeId if being updated
      if (updateCostCodeDto.parentCostCodeId !== undefined) {
        if (
          updateCostCodeDto.parentCostCodeId === '' ||
          updateCostCodeDto.parentCostCodeId === null
        ) {
          // Allow clearing parent (make it top-level)
          updateData.parentCostCodeId = null;
          updateData.showWhenParentValue = null;
        } else {
          const parentExists = await this.prisma.costCode.findUnique({
            where: { id: updateCostCodeDto.parentCostCodeId },
          });

          if (!parentExists) {
            throw new NotFoundException(
              `Parent cost code with ID ${updateCostCodeDto.parentCostCodeId} not found`,
            );
          }

          // Prevent circular dependency
          if (updateCostCodeDto.parentCostCodeId === id) {
            throw new ConflictException('Cost code cannot be its own parent');
          }
        }
      }
      if (
        updateCostCodeDto.basePrice !== undefined ||
        updateCostCodeDto.markup !== undefined
      ) {
        const existingCostCode = (await this.findOne(id)).data;
        const updatedBasePrice =
          updateCostCodeDto.basePrice ?? Number(existingCostCode.basePrice);
        const updatedMarkup =
          updateCostCodeDto.markup ?? Number(existingCostCode.markup);
        if (updateCostCodeDto.clientPrice === undefined) {
          updateData.clientPrice = updatedBasePrice * (1 + updatedMarkup / 100);
        }
      }

      const costCode = await this.prisma.costCode.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          service: true,
          options: {
            orderBy: { displayOrder: 'asc' },
          },
          parentCostCode: true,
          childCostCodes: {
            where: { isActive: true },
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
          service: true,
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

  async reorder(items: { id: string; displayOrder: number }[]) {
    try {
      await this.prisma.$transaction(
        items.map(({ id, displayOrder }) =>
          this.prisma.costCode.update({
            where: { id },
            data: { displayOrder },
          }),
        ),
      );
      return { message: 'Cost codes reordered successfully' };
    } catch (error) {
      throw new Error(`Failed to reorder cost codes: ${error.message}`);
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

  async addImage(costCodeId: string, fileInstanceId: string) {
    await this.findOne(costCodeId);
    const count = await this.prisma.costCodeImage.count({
      where: { costCodeId },
    });
    const image = await this.prisma.costCodeImage.create({
      data: { costCodeId, fileInstanceId, displayOrder: count },
      include: { fileInstance: true },
    });
    return { message: 'Image added successfully', data: image };
  }

  async removeImage(imageId: string) {
    await this.prisma.costCodeImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted successfully' };
  }

  async reorderImages(items: { id: string; displayOrder: number }[]) {
    await this.prisma.$transaction(
      items.map(({ id, displayOrder }) =>
        this.prisma.costCodeImage.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
    return { message: 'Images reordered successfully' };
  }

  async exportForBuildertrend(): Promise<{
    buffer: ExcelJS.Buffer;
    filename: string;
  }> {
    const UNIT_MAP: Record<string, string> = {
      FIXED: 'LS',
      PER_SQFT: 'SF',
      PER_LF: 'LF',
      PER_EACH: 'EA',
      PER_LOT: 'LS',
      PER_SET: 'LS',
      PER_UPGRADE: 'EA',
    };

    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BBurn Builders';
    workbook.created = new Date();

    for (const service of services) {
      const costCodes = await this.prisma.costCode.findMany({
        where: { serviceId: service.id, isActive: true, excludeFromExport: false },
        include: { category: true },
        orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
      });

      const sheetName = service.name.slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      const columns = [
        { header: 'Category',     key: 'category',    width: 20 },
        { header: 'Cost Code',    key: 'code',        width: 20 },
        { header: 'Title',        key: 'title',       width: 30 },
        { header: 'Description',  key: 'description', width: 40 },
        { header: 'Quantity',     key: 'quantity',    width: 10 },
        { header: 'Unit',         key: 'unit',        width: 10 },
        { header: 'Unit Cost',    key: 'unitCost',    width: 14 },
        { header: 'Cost Type',    key: 'costType',    width: 12 },
        { header: 'Marked As',    key: 'markedAs',    width: 14 },
        { header: 'Builder Cost', key: 'builderCost', width: 14 },
        { header: 'Markup',       key: 'markup',      width: 10 },
        { header: 'Markup Type',  key: 'markupType',  width: 12 },
        { header: 'Client Price', key: 'clientPrice', width: 14 },
        { header: 'Margin',       key: 'margin',      width: 10 },
        { header: 'Profit',       key: 'profit',      width: 12 },
      ];

      sheet.columns = columns;

      // Style header
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A365D' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      sheet.getRow(1).height = 20;

      for (const cc of costCodes) {
        const quantity = 1;
        const unitCost = Number(cc.basePrice);
        const clientPrice = Number(cc.clientPrice);
        const markupPct = Number(cc.markup);
        const builderCost = quantity * unitCost;
        const clientTotal = quantity * clientPrice;
        const profit = clientTotal - builderCost;
        const margin = clientTotal > 0 ? profit / clientTotal : 0;
        const markup = builderCost > 0 ? profit / builderCost : 0;

        const row = sheet.addRow({
          category:    cc.category?.name ?? '',
          code:        cc.code,
          title:       cc.elies ?? cc.name,
          description: cc.description ?? '',
          quantity,
          unit:        UNIT_MAP[cc.unitType] ?? 'LS',
          unitCost,
          costType:    '',
          markedAs:    '',
          builderCost,
          markup,
          markupType:  '%',
          clientPrice: clientTotal,
          margin,
          profit,
        });

        row.getCell('quantity').numFmt    = '0.00';
        row.getCell('unitCost').numFmt    = '#,##0.00';
        row.getCell('builderCost').numFmt = '#,##0.00';
        row.getCell('markup').numFmt      = '0.0000';
        row.getCell('clientPrice').numFmt = '#,##0.00';
        row.getCell('margin').numFmt      = '0.0000';
        row.getCell('profit').numFmt      = '#,##0.00';

        // Suppress markup% info — just for reference
        void markupPct;
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `buildertrend-cost-codes-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return { buffer, filename };
  }
}
