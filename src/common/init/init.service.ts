import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  private async createSuperAdmin() {
    try {
      const email = this.configService.get<string>(
        'SUPER_ADMIN_EMAIL',
        'admin@example.com',
      );
      const password = this.configService.get<string>(
        'SUPER_ADMIN_PASSWORD',
        'admin123',
      );

      // Check if super admin already exists
      const existingSuperAdmin = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingSuperAdmin) {
        this.logger.log(`Super admin already exists with email: ${email}`);
        return;
      }

      // Create super admin
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.create({
        data: {
          name: 'Super Admin',
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      this.logger.log(
        `✅ Super admin created successfully with email: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create super admin: ${error.message}`,
        error.stack,
      );
    }
  }
}
