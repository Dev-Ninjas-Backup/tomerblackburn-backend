import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QuestionType, UnitType } from 'generated/prisma/enums';

export interface BackupData {
  exportedAt: string;
  version: string;
  data: {
    projectTypes: ProjectTypeRow[];
    serviceCategories: ServiceCategoryRow[];
    services: ServiceRow[];
    costCodeCategories: CostCodeCategoryRow[];
    costCodes: CostCodeRow[];
    costCodeOptions: CostCodeOptionRow[];
  };
}

interface ProjectTypeRow {
  id: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface ServiceCategoryRow {
  id: string;
  name: string;
  description?: string | null;
  projectTypeId: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface ServiceRow {
  id: string;
  code: string;
  name: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  basePrice: number;
  markup?: number;
  clientPrice?: number;
  serviceCategoryId: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface CostCodeCategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  stepNumber?: number;
  displayOrder?: number;
  isActive?: boolean;
}

interface CostCodeRow {
  id: string;
  code: string;
  name: string;
  elies?: string | null;
  tips?: string[];
  description?: string | null;
  basePrice?: number;
  markup?: number;
  clientPrice?: number;
  unitType?: UnitType;
  questionType?: QuestionType;
  step?: number;
  displayOrder?: number;
  isIncludedInBase?: boolean;
  requiresQuantity?: boolean;
  isOptional?: boolean;
  isActive?: boolean;
  excludeFromExport?: boolean;
  parentCostCodeId?: string | null;
  showWhenParentValue?: string | null;
  nestedInputType?: string | null;
  categoryId: string;
  serviceId?: string | null;
}

interface CostCodeOptionRow {
  id: string;
  costCodeId: string;
  optionName: string;
  optionValue?: string | null;
  priceModifier?: number;
  isDefault?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

interface ImportResult {
  created: number;
  skipped: number;
}

export interface ImportResults {
  projectTypes: ImportResult;
  serviceCategories: ImportResult;
  services: ImportResult;
  costCodeCategories: ImportResult;
  costCodes: ImportResult;
  costCodeOptions: ImportResult;
  errors: string[];
}

@Injectable()
export class DataBackupService {
  constructor(private readonly prisma: PrismaService) {}

  async exportAll() {
    const [
      projectTypes,
      serviceCategories,
      services,
      costCodeCategories,
      costCodes,
      costCodeOptions,
    ] = await Promise.all([
      this.prisma.projectType.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.serviceCategory.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.service.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.costCodeCategory.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.costCode.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.costCodeOption.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        projectTypes,
        serviceCategories,
        services,
        costCodeCategories,
        costCodes,
        costCodeOptions,
      },
    };
  }

  async importAll(backup: BackupData) {
    const results: ImportResults = {
      projectTypes: { created: 0, skipped: 0 },
      serviceCategories: { created: 0, skipped: 0 },
      services: { created: 0, skipped: 0 },
      costCodeCategories: { created: 0, skipped: 0 },
      costCodes: { created: 0, skipped: 0 },
      costCodeOptions: { created: 0, skipped: 0 },
      errors: [],
    };

    const { data } = backup;

    // 1. Project Types
    for (const pt of data.projectTypes ?? []) {
      try {
        await this.prisma.projectType.upsert({
          where: { id: pt.id },
          update: {},
          create: {
            id: pt.id,
            name: pt.name,
            description: pt.description,
            displayOrder: pt.displayOrder ?? 0,
            isActive: pt.isActive ?? true,
          },
        });
        results.projectTypes.created++;
      } catch (e: unknown) {
        results.projectTypes.skipped++;
        results.errors.push(
          `ProjectType ${pt.name}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // 2. Service Categories
    for (const sc of data.serviceCategories ?? []) {
      try {
        await this.prisma.serviceCategory.upsert({
          where: { id: sc.id },
          update: {},
          create: {
            id: sc.id,
            name: sc.name,
            description: sc.description,
            projectTypeId: sc.projectTypeId,
            displayOrder: sc.displayOrder ?? 0,
            isActive: sc.isActive ?? true,
          },
        });
        results.serviceCategories.created++;
      } catch (e: unknown) {
        results.serviceCategories.skipped++;
        results.errors.push(
          `ServiceCategory ${sc.name}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // 3. Services
    for (const svc of data.services ?? []) {
      try {
        await this.prisma.service.upsert({
          where: { id: svc.id },
          update: {},
          create: {
            id: svc.id,
            code: svc.code,
            name: svc.name,
            shortDescription: svc.shortDescription,
            fullDescription: svc.fullDescription,
            basePrice: svc.basePrice,
            markup: svc.markup ?? 0,
            clientPrice: svc.clientPrice ?? 0,
            serviceCategoryId: svc.serviceCategoryId,
            displayOrder: svc.displayOrder ?? 0,
            isActive: svc.isActive ?? true,
          },
        });
        results.services.created++;
      } catch (e: unknown) {
        results.services.skipped++;
        results.errors.push(
          `Service ${svc.code}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // 4. Cost Code Categories
    for (const cat of data.costCodeCategories ?? []) {
      try {
        await this.prisma.costCodeCategory.upsert({
          where: { id: cat.id },
          update: {},
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            stepNumber: cat.stepNumber ?? 1,
            displayOrder: cat.displayOrder ?? 0,
            isActive: cat.isActive ?? true,
          },
        });
        results.costCodeCategories.created++;
      } catch (e: unknown) {
        results.costCodeCategories.skipped++;
        results.errors.push(
          `CostCodeCategory ${cat.name}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // 5. Cost Codes — parents first, then children
    const parentCodes = (data.costCodes ?? []).filter(
      (c) => !c.parentCostCodeId,
    );
    const childCodes = (data.costCodes ?? []).filter(
      (c) => !!c.parentCostCodeId,
    );

    for (const cc of [...parentCodes, ...childCodes]) {
      try {
        await this.prisma.costCode.upsert({
          where: { id: cc.id },
          update: {},
          create: {
            id: cc.id,
            code: cc.code,
            name: cc.name,
            elies: cc.elies,
            tips: cc.tips ?? [],
            description: cc.description,
            basePrice: cc.basePrice ?? 0,
            markup: cc.markup ?? 0,
            clientPrice: cc.clientPrice ?? 0,
            unitType: cc.unitType ?? UnitType.FIXED,
            questionType: cc.questionType ?? QuestionType.WHITE,
            step: cc.step ?? 1,
            displayOrder: cc.displayOrder ?? 0,
            isIncludedInBase: cc.isIncludedInBase ?? false,
            requiresQuantity: cc.requiresQuantity ?? false,
            isOptional: cc.isOptional ?? false,
            isActive: cc.isActive ?? true,
            excludeFromExport: cc.excludeFromExport ?? false,
            parentCostCodeId: cc.parentCostCodeId ?? null,
            showWhenParentValue: cc.showWhenParentValue ?? null,
            nestedInputType: cc.nestedInputType ?? null,
            categoryId: cc.categoryId,
            serviceId: cc.serviceId ?? null,
          },
        });
        results.costCodes.created++;
      } catch (e: unknown) {
        results.costCodes.skipped++;
        results.errors.push(
          `CostCode ${cc.code}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // 6. Cost Code Options
    for (const opt of data.costCodeOptions ?? []) {
      try {
        await this.prisma.costCodeOption.upsert({
          where: { id: opt.id },
          update: {},
          create: {
            id: opt.id,
            costCodeId: opt.costCodeId,
            optionName: opt.optionName,
            optionValue: opt.optionValue,
            priceModifier: opt.priceModifier ?? 0,
            isDefault: opt.isDefault ?? false,
            displayOrder: opt.displayOrder ?? 0,
            isActive: opt.isActive ?? true,
          },
        });
        results.costCodeOptions.created++;
      } catch (e: unknown) {
        results.costCodeOptions.skipped++;
        results.errors.push(
          `CostCodeOption ${opt.optionName}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    return {
      message: 'Import completed',
      results,
    };
  }
}
