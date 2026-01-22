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
      const errorName = error?.constructor?.name || error?.name;
      const errorMessage =
        typeof error?.message === 'string'
          ? error.message.split('\n')[0]
          : 'Unknown error';

      // Handle different types of Prisma errors
      if (errorName === 'PrismaClientValidationError') {
        this.logger.error(
          '❌ Invalid Prisma query. Please check your database schema and run: npx prisma generate && npx prisma migrate dev',
        );
      } else if (errorName === 'PrismaClientInitializationError') {
        this.logger.error(
          '❌ Failed to connect to database. Please check your DATABASE_URL in .env file',
        );
      } else if (error?.code && typeof error.code === 'string') {
        // Handle Prisma error codes
        if (error.code.startsWith('P')) {
          switch (error.code) {
            case 'P2021':
              this.logger.error(
                '❌ Database table does not exist. Please run: npx prisma migrate dev',
              );
              break;
            case 'P2002':
              this.logger.warn('⚠️ Super admin with this email already exists');
              break;
            case 'P2025':
              this.logger.error('❌ Required record not found in database');
              break;
            default:
              this.logger.error(
                `❌ Database error (${error.code}): ${errorMessage}`,
              );
          }
        } else {
          this.logger.error(`❌ Failed to create super admin: ${errorMessage}`);
        }
      } else {
        this.logger.error(`❌ Failed to create super admin: ${errorMessage}`);
      }
    }
  }
}
