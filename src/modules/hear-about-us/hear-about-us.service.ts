import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateHearAboutUsOptionDto,
  UpdateHearAboutUsOptionDto,
  UpdateHearAboutUsSettingDto,
} from './dto/hear-about-us.dto';

@Injectable()
export class HearAboutUsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSetting() {
    let setting = await this.prisma.hearAboutUsSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.hearAboutUsSetting.create({
        data: { isEnabled: true },
      });
    }
    return { message: 'Setting retrieved successfully', data: setting };
  }

  async updateSetting(dto: UpdateHearAboutUsSettingDto) {
    let setting = await this.prisma.hearAboutUsSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.hearAboutUsSetting.create({
        data: { isEnabled: dto.isEnabled },
      });
    } else {
      setting = await this.prisma.hearAboutUsSetting.update({
        where: { id: setting.id },
        data: { isEnabled: dto.isEnabled },
      });
    }
    return { message: 'Setting updated successfully', data: setting };
  }

  // ── Options ───────────────────────────────────────────────────────────────

  async getActiveOptions() {
    const options = await this.prisma.hearAboutUsOption.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { message: 'Options retrieved successfully', data: options };
  }

  async getAllOptions() {
    const options = await this.prisma.hearAboutUsOption.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return { message: 'Options retrieved successfully', data: options };
  }

  async createOption(dto: CreateHearAboutUsOptionDto) {
    const option = await this.prisma.hearAboutUsOption.create({ data: dto });
    return { message: 'Option created successfully', data: option };
  }

  async updateOption(id: string, dto: UpdateHearAboutUsOptionDto) {
    const option = await this.prisma.hearAboutUsOption.update({
      where: { id },
      data: dto,
    });
    return { message: 'Option updated successfully', data: option };
  }

  async deleteOption(id: string) {
    await this.prisma.hearAboutUsOption.delete({ where: { id } });
    return { message: 'Option deleted successfully' };
  }

  async reorderOptions(items: { id: string; displayOrder: number }[]) {
    await this.prisma.$transaction(
      items.map(({ id, displayOrder }) =>
        this.prisma.hearAboutUsOption.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
    return { message: 'Options reordered successfully' };
  }
}
