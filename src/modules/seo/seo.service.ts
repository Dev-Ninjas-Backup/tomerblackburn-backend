import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateSeoSettingsDto } from './dto/update-seo-settings.dto';
import { UpdateSeoPageDto } from './dto/update-seo-page.dto';

const DEFAULT_PAGES = [
  {
    path: '/',
    pageName: 'Home Page',
    title:
      'BBurn Builders — Premier Custom Remodeling & Construction | Chicago, IL',
    description:
      "Chicago's premier residential remodeling and construction company. Specializing in luxury bathroom remodels, custom carpentry, plumbing, and whole-home renovations.",
    keywords:
      'home remodeling chicago, bathroom remodel chicago, custom carpentry, luxury renovations illinois, general contractor chicago, bburn builders',
    priority: 1.0,
    changeFreq: 'weekly',
  },
  {
    path: '/estimator',
    pageName: 'Instant Project Estimator',
    title:
      'Instant Online Remodel Estimator — Get Transparent Pricing | BBurn Builders',
    description:
      'Calculate live pricing and instantly configure your custom bathroom, kitchen, or home renovation in Chicago with our transparent cost estimator tool.',
    keywords:
      'remodel calculator, bathroom remodel cost estimator, instant construction estimate chicago, renovation quote bburn builders',
    priority: 0.95,
    changeFreq: 'weekly',
  },
  {
    path: '/portfolio',
    pageName: 'Portfolio & Completed Projects',
    title:
      'Our Portfolio — Luxury Remodeling Projects & Transformations | BBurn Builders',
    description:
      'Explore our gallery of completed bathroom remodels, custom carpentry, and architectural renovations across Chicago and surrounding suburbs.',
    keywords:
      'chicago remodeling portfolio, bathroom before after photos, luxury home renovation gallery, bburn builders projects',
    priority: 0.85,
    changeFreq: 'weekly',
  },
  {
    path: '/about',
    pageName: 'About Us',
    title:
      'About BBurn Builders — Dedicated Craftsmanship & Elite Building Standards',
    description:
      'Learn about BBurn Builders, our founder Tomer Blackburn, and our commitment to uncompromising craftsmanship, transparency, and architectural excellence in Chicago.',
    keywords:
      'about bburn builders, tomer blackburn, chicago general contractor team, luxury builder history',
    priority: 0.75,
    changeFreq: 'monthly',
  },
  {
    path: '/contact',
    pageName: 'Contact Us',
    title: 'Contact BBurn Builders — Start Your Renovation Journey Today',
    description:
      'Connect with our team to schedule an on-site consultation, discuss project timelines, or request information regarding your upcoming home remodeling project.',
    keywords:
      'contact bburn builders, hire general contractor chicago, remodel consultation phone 773-403-9950',
    priority: 0.8,
    changeFreq: 'monthly',
  },
  {
    path: '/privacy-policy',
    pageName: 'Privacy Policy',
    title: 'Privacy Policy — BBurn Builders',
    description:
      'Review our privacy policy to understand how BBurn Builders collects, protects, and handles your personal information.',
    keywords: 'privacy policy bburn builders',
    priority: 0.3,
    changeFreq: 'yearly',
  },
  {
    path: '/terms-of-service',
    pageName: 'Terms of Service',
    title: 'Terms of Service — BBurn Builders',
    description:
      'Review the terms and conditions for using the BBurn Builders website, online estimator, and remodeling services.',
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
