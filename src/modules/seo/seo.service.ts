import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateSeoSettingsDto } from './dto/update-seo-settings.dto';
import { UpdateSeoPageDto } from './dto/update-seo-page.dto';

const DEFAULT_PAGES = [
  {
    path: '/',
    pageName: 'Home Page',
    title: 'BBurn Builders — Premier Custom Remodeling | Chicago, IL',
    description:
      "Chicago's premier remodeling contractor. Specializing in luxury bathroom remodels, custom carpentry, and home renovations. Get your free instant estimate!",
    keywords:
      'home remodeling chicago, bathroom remodel chicago, custom carpentry, luxury renovations illinois, general contractor chicago, bburn builders',
    priority: 1.0,
    changeFreq: 'weekly',
  },
  {
    path: '/estimator',
    pageName: 'Instant Project Estimator',
    title: 'Online Remodel Estimator — Instant Pricing | BBurn Builders',
    description:
      'Calculate live remodeling costs and configure your custom bathroom or home renovation in Chicago with our instant, transparent project estimator tool.',
    keywords:
      'remodel calculator, bathroom remodel cost estimator, instant construction estimate chicago, renovation quote bburn builders',
    priority: 0.95,
    changeFreq: 'weekly',
  },
  {
    path: '/portfolio',
    pageName: 'Portfolio & Completed Projects',
    title: 'Remodeling Portfolio & Transformations | BBurn Builders',
    description:
      'Explore our portfolio of completed luxury bathroom remodels, custom carpentry, and architectural renovations across Chicago and surrounding suburbs.',
    keywords:
      'chicago remodeling portfolio, bathroom before after photos, luxury home renovation gallery, bburn builders projects',
    priority: 0.85,
    changeFreq: 'weekly',
  },
  {
    path: '/about',
    pageName: 'About Us',
    title: 'About Us — Craftsmanship & Standards | BBurn Builders',
    description:
      'Learn about BBurn Builders, founder Tomer Blackburn, and our dedication to elite craftsmanship, transparency, and architectural remodeling in Chicago.',
    keywords:
      'about bburn builders, tomer blackburn, chicago general contractor team, luxury builder history',
    priority: 0.75,
    changeFreq: 'monthly',
  },
  {
    path: '/contact',
    pageName: 'Contact Us',
    title: 'Contact Us — Schedule Consultation | BBurn Builders',
    description:
      'Connect with BBurn Builders to schedule an on-site consultation, discuss timelines, or get answers for your upcoming Chicago home remodeling project.',
    keywords:
      'contact bburn builders, hire general contractor chicago, remodel consultation phone 773-403-9950',
    priority: 0.8,
    changeFreq: 'monthly',
  },
  {
    path: '/privacy-policy',
    pageName: 'Privacy Policy',
    title: 'Privacy Policy | BBurn Builders',
    description:
      'Review the privacy policy for BBurn Builders to understand how we collect, protect, and manage your personal data across our online estimator services.',
    keywords: 'privacy policy bburn builders',
    priority: 0.3,
    changeFreq: 'yearly',
  },
  {
    path: '/terms-of-service',
    pageName: 'Terms of Service',
    title: 'Terms of Service | BBurn Builders',
    description:
      'Review the terms of service and conditions for using the BBurn Builders website, online remodel estimator tool, and construction consulting services.',
    keywords: 'terms of service bburn builders',
    priority: 0.3,
    changeFreq: 'yearly',
  },
];

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getGlobalSettings() {
    try {
      let settings = await this.prisma.seoSettings.findFirst();

      if (!settings) {
        settings = await this.prisma.seoSettings.create({
          data: {},
        });
        this.logger.log('Created default global SEO settings');
      }

      return {
        message: 'Global SEO settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      this.logger.error(`Failed to get global SEO settings: ${error.message}`);
      throw error;
    }
  }

  async updateGlobalSettings(dto: UpdateSeoSettingsDto) {
    try {
      let settings = await this.prisma.seoSettings.findFirst();

      if (!settings) {
        settings = await this.prisma.seoSettings.create({
          data: dto,
        });
      } else {
        settings = await this.prisma.seoSettings.update({
          where: { id: settings.id },
          data: dto,
        });
      }

      return {
        message: 'Global SEO settings updated successfully',
        data: settings,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update global SEO settings: ${error.message}`,
      );
      throw error;
    }
  }

  async getAllPages() {
    try {
      // Ensure default standard pages are seeded
      await this.ensureDefaultPagesSeeded();

      const pages = await this.prisma.seoPage.findMany({
        orderBy: [{ priority: 'desc' }, { path: 'asc' }],
      });

      return {
        message: 'SEO pages retrieved successfully',
        data: pages,
      };
    } catch (error) {
      this.logger.error(`Failed to get SEO pages: ${error.message}`);
      throw error;
    }
  }

  async getPageByPath(path: string) {
    try {
      await this.ensureDefaultPagesSeeded();

      const page = await this.prisma.seoPage.findUnique({
        where: { path },
      });

      if (!page) {
        return {
          message: 'Page not found, falling back to global',
          data: null,
        };
      }

      return {
        message: 'Page SEO retrieved successfully',
        data: page,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get SEO page for path ${path}: ${error.message}`,
      );
      throw error;
    }
  }

  async updatePage(id: string, dto: UpdateSeoPageDto) {
    try {
      const existing = await this.prisma.seoPage.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`SEO page with ID ${id} not found`);
      }

      const updated = await this.prisma.seoPage.update({
        where: { id },
        data: dto,
      });

      return {
        message: 'Page SEO updated successfully',
        data: updated,
      };
    } catch (error) {
      this.logger.error(`Failed to update SEO page: ${error.message}`);
      throw error;
    }
  }

  async getPublicBundle() {
    try {
      await this.ensureDefaultPagesSeeded();

      let global = await this.prisma.seoSettings.findFirst();
      if (!global) {
        global = await this.prisma.seoSettings.create({ data: {} });
      }

      const pages = await this.prisma.seoPage.findMany({
        orderBy: [{ priority: 'desc' }, { path: 'asc' }],
      });

      return {
        message: 'Public SEO bundle retrieved successfully',
        data: {
          global,
          pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get public SEO bundle: ${error.message}`);
      throw error;
    }
  }

  private async ensureDefaultPagesSeeded() {
    try {
      for (const defaultPage of DEFAULT_PAGES) {
        const existing = await this.prisma.seoPage.findUnique({
          where: { path: defaultPage.path },
        });

        if (!existing) {
          await this.prisma.seoPage.create({
            data: defaultPage,
          });
        }
      }
    } catch (err) {
      this.logger.warn(`Could not seed default SEO pages: ${err.message}`);
    }
  }
}
