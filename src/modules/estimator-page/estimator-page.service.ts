import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateEstimatorPageDto } from './dto/create-estimator-page.dto';
import { UpdateEstimatorPageDto } from './dto/update-estimator-page.dto';
import { CreateHowItWorksStepDto } from './dto/create-how-it-works-step.dto';
import { UpdateHowItWorksStepDto } from './dto/update-how-it-works-step.dto';
import { CreateWhyChooseUsFeatureDto } from './dto/create-why-choose-us-feature.dto';
import { UpdateWhyChooseUsFeatureDto } from './dto/update-why-choose-us-feature.dto';

@Injectable()
export class EstimatorPageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private async validateFileExists(fileId: string): Promise<void> {
    if (!fileId || !fileId.trim()) {
      return;
    }

    const fileExists = await this.prisma.fileInstance.findUnique({
      where: { id: fileId },
    });

    if (!fileExists) {
      throw new BadRequestException(
        `File with ID '${fileId}' does not exist. Please upload the file first using the /upload endpoint.`,
      );
    }
  }

  async getEstimatorPage() {
    try {
      let page = await this.prisma.estimatorPage.findFirst({
        include: {
          backgroundImage: true,
        },
      });

      if (!page) {
        page = await this.prisma.estimatorPage.create({
          data: {
            title: 'Estimate Your Bathroom Remodel Cost',
            description:
              'Professional bathroom remodels - real quotes, competitive pricing, 15 verified steps',
            howItWorksTitle: 'How It Works',
            whyChooseUsTitle: 'Why Choose Us',
          },
          include: {
            backgroundImage: true,
          },
        });
      }

      return {
        message: 'Estimator page retrieved successfully',
        data: page,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve estimator page: ${error.message}`);
    }
  }

  async createEstimatorPage(
    createDto: CreateEstimatorPageDto,
    backgroundImage?: Express.Multer.File,
  ) {
    try {
      const existing = await this.prisma.estimatorPage.findFirst();

      if (existing) {
        return this.updateEstimatorPage(
          existing.id,
          createDto,
          backgroundImage,
        );
      }

      let backgroundImageId = createDto.backgroundImageId;

      if (backgroundImage) {
        const uploadedFile =
          await this.uploadService.uploadFile(backgroundImage);
        backgroundImageId = uploadedFile.id;
      } else if (backgroundImageId) {
        await this.validateFileExists(backgroundImageId);
      }

      const data: any = {
        title: createDto.title,
        description: createDto.description,
        howItWorksTitle: createDto.howItWorksTitle || 'How It Works',
        whyChooseUsTitle: createDto.whyChooseUsTitle || 'Why Choose Us',
      };

      if (backgroundImageId && backgroundImageId.trim()) {
        data.backgroundImageId = backgroundImageId;
      }

      const page = await this.prisma.estimatorPage.create({
        data,
        include: {
          backgroundImage: true,
        },
      });

      return {
        message: 'Estimator page created successfully',
        data: page,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create estimator page: ${error.message}`,
      );
    }
  }

  async updateEstimatorPage(
    id: string,
    updateDto: UpdateEstimatorPageDto,
    backgroundImage?: Express.Multer.File,
  ) {
    try {
      const existing = await this.prisma.estimatorPage.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Estimator page with ID ${id} not found`);
      }

      let backgroundImageId = updateDto.backgroundImageId;

      if (backgroundImage) {
        const uploadedFile =
          await this.uploadService.uploadFile(backgroundImage);
        backgroundImageId = uploadedFile.id;
      } else if (backgroundImageId && backgroundImageId.trim()) {
        await this.validateFileExists(backgroundImageId);
      }

      const data: any = {};

      if (updateDto.title !== undefined) data.title = updateDto.title;
      if (updateDto.description !== undefined)
        data.description = updateDto.description;
      if (updateDto.howItWorksTitle !== undefined)
        data.howItWorksTitle = updateDto.howItWorksTitle;
      if (updateDto.whyChooseUsTitle !== undefined)
        data.whyChooseUsTitle = updateDto.whyChooseUsTitle;

      if (backgroundImageId !== undefined) {
        data.backgroundImageId =
          backgroundImageId && backgroundImageId.trim()
            ? backgroundImageId
            : null;
      }

      const page = await this.prisma.estimatorPage.update({
        where: { id },
        data,
        include: {
          backgroundImage: true,
        },
      });

      return {
        message: 'Estimator page updated successfully',
        data: page,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update estimator page: ${error.message}`,
      );
    }
  }

  async updateCurrentEstimatorPage(
    updateDto: UpdateEstimatorPageDto,
    backgroundImage?: Express.Multer.File,
  ) {
    try {
      const page = await this.prisma.estimatorPage.findFirst();

      if (!page) {
        return this.createEstimatorPage(
          updateDto as CreateEstimatorPageDto,
          backgroundImage,
        );
      }

      return this.updateEstimatorPage(page.id, updateDto, backgroundImage);
    } catch (error) {
      throw new Error(`Failed to update estimator page: ${error.message}`);
    }
  }

  async getAllHowItWorksSteps() {
    try {
      const steps = await this.prisma.howItWorksStep.findMany({
        orderBy: {
          stepNumber: 'asc',
        },
      });

      return {
        message:
          steps.length > 0
            ? 'How It Works steps retrieved successfully'
            : 'No steps found',
        count: steps.length,
        data: steps,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve How It Works steps: ${error.message}`,
      );
    }
  }

  async getHowItWorksStepById(id: string) {
    try {
      const step = await this.prisma.howItWorksStep.findUnique({
        where: { id },
      });

      if (!step) {
        throw new NotFoundException(
          `How It Works step with ID ${id} not found`,
        );
      }

      return {
        message: 'How It Works step retrieved successfully',
        data: step,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve How It Works step: ${error.message}`);
    }
  }

  async createHowItWorksStep(createDto: CreateHowItWorksStepDto) {
    try {
      const step = await this.prisma.howItWorksStep.create({
        data: {
          stepNumber: createDto.stepNumber,
          title: createDto.title,
          description: createDto.description,
        },
      });

      return {
        message: 'How It Works step created successfully',
        data: step,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create How It Works step: ${error.message}`,
      );
    }
  }

  async updateHowItWorksStep(id: string, updateDto: UpdateHowItWorksStepDto) {
    try {
      await this.getHowItWorksStepById(id);

      const data: any = {};

      if (updateDto.stepNumber !== undefined)
        data.stepNumber = updateDto.stepNumber;
      if (updateDto.title !== undefined) data.title = updateDto.title;
      if (updateDto.description !== undefined)
        data.description = updateDto.description;

      const step = await this.prisma.howItWorksStep.update({
        where: { id },
        data,
      });

      return {
        message: 'How It Works step updated successfully',
        data: step,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update How It Works step: ${error.message}`,
      );
    }
  }

  async deleteHowItWorksStep(id: string) {
    try {
      await this.getHowItWorksStepById(id);

      await this.prisma.howItWorksStep.delete({
        where: { id },
      });

      return {
        message: 'How It Works step deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete How It Works step: ${error.message}`);
    }
  }

  async getAllWhyChooseUsFeatures() {
    try {
      const features = await this.prisma.whyChooseUsFeature.findMany({
        include: {
          icon: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      return {
        message:
          features.length > 0
            ? 'Why Choose Us features retrieved successfully'
            : 'No features found',
        count: features.length,
        data: features,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve Why Choose Us features: ${error.message}`,
      );
    }
  }

  async getWhyChooseUsFeatureById(id: string) {
    try {
      const feature = await this.prisma.whyChooseUsFeature.findUnique({
        where: { id },
        include: {
          icon: true,
        },
      });

      if (!feature) {
        throw new NotFoundException(
          `Why Choose Us feature with ID ${id} not found`,
        );
      }

      return {
        message: 'Why Choose Us feature retrieved successfully',
        data: feature,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to retrieve Why Choose Us feature: ${error.message}`,
      );
    }
  }

  async createWhyChooseUsFeature(
    createDto: CreateWhyChooseUsFeatureDto,
    icon?: Express.Multer.File,
  ) {
    try {
      let iconId = createDto.iconId;

      if (icon) {
        const uploadedFile = await this.uploadService.uploadFile(icon);
        iconId = uploadedFile.id;
      } else if (iconId) {
        await this.validateFileExists(iconId);
      }

      const data: any = {
        title: createDto.title,
        description: createDto.description,
        order: createDto.order || 0,
      };

      if (iconId && iconId.trim()) {
        data.iconId = iconId;
      }

      const feature = await this.prisma.whyChooseUsFeature.create({
        data,
        include: {
          icon: true,
        },
      });

      return {
        message: 'Why Choose Us feature created successfully',
        data: feature,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create Why Choose Us feature: ${error.message}`,
      );
    }
  }

  async updateWhyChooseUsFeature(
    id: string,
    updateDto: UpdateWhyChooseUsFeatureDto,
    icon?: Express.Multer.File,
  ) {
    try {
      await this.getWhyChooseUsFeatureById(id);

      let iconId = updateDto.iconId;

      if (icon) {
        const uploadedFile = await this.uploadService.uploadFile(icon);
        iconId = uploadedFile.id;
      } else if (iconId && iconId.trim()) {
        await this.validateFileExists(iconId);
      }

      const data: any = {};

      if (updateDto.title !== undefined) data.title = updateDto.title;
      if (updateDto.description !== undefined)
        data.description = updateDto.description;
      if (updateDto.order !== undefined) data.order = updateDto.order;

      if (iconId !== undefined) {
        data.iconId = iconId && iconId.trim() ? iconId : null;
      }

      const feature = await this.prisma.whyChooseUsFeature.update({
        where: { id },
        data,
        include: {
          icon: true,
        },
      });

      return {
        message: 'Why Choose Us feature updated successfully',
        data: feature,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update Why Choose Us feature: ${error.message}`,
      );
    }
  }

  async deleteWhyChooseUsFeature(id: string) {
    try {
      await this.getWhyChooseUsFeatureById(id);

      await this.prisma.whyChooseUsFeature.delete({
        where: { id },
      });

      return {
        message: 'Why Choose Us feature deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to delete Why Choose Us feature: ${error.message}`,
      );
    }
  }

  async getCompleteEstimatorPageData() {
    try {
      const [page, howItWorksSteps, whyChooseUsFeatures] = await Promise.all([
        this.getEstimatorPage(),
        this.getAllHowItWorksSteps(),
        this.getAllWhyChooseUsFeatures(),
      ]);

      return {
        message: 'Complete estimator page data retrieved successfully',
        data: {
          page: page.data,
          howItWorksSteps: howItWorksSteps.data,
          whyChooseUsFeatures: whyChooseUsFeatures.data,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve complete estimator page data: ${error.message}`,
      );
    }
  }
}
