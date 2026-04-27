import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QuestionType, UnitType } from 'generated/prisma/enums';

export const BACKUP_TABLES = {
  // Project Management
  projectTypes: { label: 'Project Types', group: 'Project Management' },
  serviceCategories: {
    label: 'Service Categories',
    group: 'Project Management',
  },
  services: { label: 'Services', group: 'Project Management' },
  serviceCostCodes: {
    label: 'Service Cost Codes',
    group: 'Project Management',
  },
  // Cost Management
  costCodeCategories: {
    label: 'Cost Code Categories',
    group: 'Cost Management',
  },
  costCodes: { label: 'Cost Codes', group: 'Cost Management' },
  costCodeOptions: { label: 'Cost Code Options', group: 'Cost Management' },
  // Building Types
  buildingTypes: { label: 'Building Types', group: 'Building Types' },
  buildingTypeFields: {
    label: 'Building Type Fields',
    group: 'Building Types',
  },
  // Tips
  tips: { label: 'Tips', group: 'Content' },
  // Site Settings
  siteSettings: { label: 'Site Settings', group: 'Content' },
  // Portfolio
  portfolioCategories: { label: 'Portfolio Categories', group: 'Portfolio' },
} as const;

export type TableKey = keyof typeof BACKUP_TABLES;

export interface BackupData {
  exportedAt: string;
  version: string;
  tables: TableKey[];
  data: Partial<Record<TableKey, unknown[]>>;
}

export interface ImportResult {
  created: number;
  skipped: number;
}

export interface ImportResults {
  results: Partial<Record<TableKey, ImportResult>>;
  errors: string[];
}

@Injectable()
export class DataBackupService {
  constructor(private readonly prisma: PrismaService) {}

  getTableMeta() {
    return BACKUP_TABLES;
  }

  async exportSelected(tables: TableKey[]): Promise<BackupData> {
    const data: Partial<Record<TableKey, unknown[]>> = {};

    for (const table of tables) {
      switch (table) {
        case 'projectTypes':
          data.projectTypes = await this.prisma.projectType.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'serviceCategories':
          data.serviceCategories = await this.prisma.serviceCategory.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'services':
          data.services = await this.prisma.service.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'serviceCostCodes':
          data.serviceCostCodes = await this.prisma.serviceCostCode.findMany({
            orderBy: { createdAt: 'asc' },
          });
          break;
        case 'costCodeCategories':
          data.costCodeCategories = await this.prisma.costCodeCategory.findMany(
            {
              orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            },
          );
          break;
        case 'costCodes':
          data.costCodes = await this.prisma.costCode.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'costCodeOptions':
          data.costCodeOptions = await this.prisma.costCodeOption.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'buildingTypes':
          data.buildingTypes = await this.prisma.buildingType.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          });
          break;
        case 'buildingTypeFields':
          data.buildingTypeFields =
            await this.prisma.buildingTypeField.findMany({
              orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            });
          break;
        case 'tips':
          data.tips = await this.prisma.tip.findMany({
            orderBy: { position: 'asc' },
          });
          break;
        case 'siteSettings':
          data.siteSettings = await this.prisma.siteSettings.findMany();
          break;
        case 'portfolioCategories':
          data.portfolioCategories =
            await this.prisma.portfolioCategory.findMany({
              orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            });
          break;
      }
    }

    return {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      tables,
      data,
    };
  }

  async importSelected(backup: BackupData): Promise<ImportResults> {
    const results: Partial<Record<TableKey, ImportResult>> = {};
    const errors: string[] = [];

    const { data, tables } = backup;

    // Import order matters for FK constraints
    const orderedTables: TableKey[] = [
      'projectTypes',
      'serviceCategories',
      'services',
      'costCodeCategories',
      'costCodes',
      'costCodeOptions',
      'serviceCostCodes',
      'buildingTypes',
      'buildingTypeFields',
      'tips',
      'siteSettings',
      'portfolioCategories',
    ].filter((t) => tables.includes(t as TableKey)) as TableKey[];

    for (const table of orderedTables) {
      results[table] = { created: 0, skipped: 0 };
      const rows = data[table] ?? [];

      for (const row of rows) {
        try {
          await this.importRow(table, row as Record<string, unknown>);
          results[table].created++;
        } catch (e: unknown) {
          results[table].skipped++;
          errors.push(
            `[${table}]: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }

    return { results, errors };
  }

  private async importRow(table: TableKey, row: Record<string, unknown>) {
    switch (table) {
      case 'projectTypes':
        await this.prisma.projectType.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            name: row.name as string,
            description: row.description as string | null,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;

      case 'serviceCategories':
        await this.prisma.serviceCategory.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            name: row.name as string,
            description: row.description as string | null,
            projectTypeId: row.projectTypeId as string,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;

      case 'services':
        await this.prisma.service.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            code: row.code as string,
            name: row.name as string,
            shortDescription: row.shortDescription as string | null,
            fullDescription: row.fullDescription as string | null,
            basePrice: row.basePrice as number,
            markup: (row.markup as number) ?? 0,
            clientPrice: (row.clientPrice as number) ?? 0,
            serviceCategoryId: row.serviceCategoryId as string,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;

      case 'costCodeCategories':
        await this.prisma.costCodeCategory.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            name: row.name as string,
            slug: row.slug as string,
            description: row.description as string | null,
            stepNumber: (row.stepNumber as number) ?? 1,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;

      case 'costCodes':
        await this.prisma.costCode.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            code: row.code as string,
            name: row.name as string,
            elies: row.elies as string | null,
            tips: (row.tips as string[]) ?? [],
            description: row.description as string | null,
            basePrice: (row.basePrice as number) ?? 0,
            markup: (row.markup as number) ?? 0,
            clientPrice: (row.clientPrice as number) ?? 0,
            unitType: (row.unitType as UnitType) ?? UnitType.FIXED,
            questionType:
              (row.questionType as QuestionType) ?? QuestionType.WHITE,
            step: (row.step as number) ?? 1,
            displayOrder: (row.displayOrder as number) ?? 0,
            isIncludedInBase: (row.isIncludedInBase as boolean) ?? false,
            requiresQuantity: (row.requiresQuantity as boolean) ?? false,
            isOptional: (row.isOptional as boolean) ?? false,
            isActive: (row.isActive as boolean) ?? true,
            excludeFromExport: (row.excludeFromExport as boolean) ?? false,
            parentCostCodeId: (row.parentCostCodeId as string) ?? null,
            showWhenParentValue: (row.showWhenParentValue as string) ?? null,
            nestedInputType: (row.nestedInputType as string) ?? null,
            categoryId: row.categoryId as string,
            serviceId: (row.serviceId as string) ?? null,
          },
        });
        break;

      case 'costCodeOptions':
        await this.prisma.costCodeOption.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            costCodeId: row.costCodeId as string,
            optionName: row.optionName as string,
            optionValue: row.optionValue as string | null,
            priceModifier: (row.priceModifier as number) ?? 0,
            isDefault: (row.isDefault as boolean) ?? false,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;

      case 'serviceCostCodes':
        await this.prisma.serviceCostCode.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            serviceId: row.serviceId as string,
            costCodeId: row.costCodeId as string,
            isIncludedInBase: (row.isIncludedInBase as boolean) ?? false,
            isRequired: (row.isRequired as boolean) ?? false,
            isVisible: (row.isVisible as boolean) ?? true,
            defaultQuantity: (row.defaultQuantity as number) ?? null,
            priceOverride: (row.priceOverride as number) ?? null,
            displayOrder: (row.displayOrder as number) ?? 0,
          },
        });
        break;

      case 'buildingTypes':
        await this.prisma.buildingType.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            name: row.name as string,
            price: (row.price as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
            displayOrder: (row.displayOrder as number) ?? 0,
          },
        });
        break;

      case 'buildingTypeFields':
        await this.prisma.buildingTypeField.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            buildingTypeId: row.buildingTypeId as string,
            label: row.label as string,
            fieldType: (row.fieldType as string) ?? 'text',
            placeholder: row.placeholder as string | null,
            isRequired: (row.isRequired as boolean) ?? false,
            displayOrder: (row.displayOrder as number) ?? 0,
          },
        });
        break;

      case 'tips':
        await this.prisma.tip.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            position: row.position as number,
            message: row.message as string,
          },
        });
        break;

      case 'siteSettings':
        await this.prisma.siteSettings.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            siteTitle: row.siteTitle as string,
            siteDescription: row.siteDescription as string | null,
            contactNumber: row.contactNumber as string | null,
            contactEmail: row.contactEmail as string | null,
            location: row.location as string | null,
            address: row.address as string | null,
            facebookUrl: row.facebookUrl as string | null,
            instagramUrl: row.instagramUrl as string | null,
            twitterUrl: row.twitterUrl as string | null,
            ctaBannerText: row.ctaBannerText as string | null,
            ctaBannerEnabled: (row.ctaBannerEnabled as boolean) ?? true,
          },
        });
        break;

      case 'portfolioCategories':
        await this.prisma.portfolioCategory.upsert({
          where: { id: row.id as string },
          update: {},
          create: {
            id: row.id as string,
            name: row.name as string,
            slug: row.slug as string,
            description: row.description as string | null,
            displayOrder: (row.displayOrder as number) ?? 0,
            isActive: (row.isActive as boolean) ?? true,
          },
        });
        break;
    }
  }
}
