import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { BathroomTypesModule } from './modules/bathroom-types/bathroom-types.module';
import { CostCodeCategoriesModule } from './modules/cost-code-categories/cost-code-categories.module';
import { CostCodesModule } from './modules/cost-codes/cost-codes.module';
import { CostCodeOptionsModule } from './modules/cost-code-options/cost-code-options.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { EmailLogsModule } from './modules/email-logs/email-logs.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { BathroomTypeCostCodesModule } from './modules/bathroom-type-cost-codes/bathroom-type-cost-codes.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { HomePageModule } from './modules/home-page/home-page.module';
import { AboutUsModule } from './modules/about-us/about-us.module';
import { PricingService } from './modules/pricing/pricing.service';
import { EmailService } from './modules/notifications/email.service';
import { PdfGeneratorService } from './modules/pdf/pdf-generator.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PrismaModule,
    BathroomTypesModule,
    CostCodeCategoriesModule,
    CostCodesModule,
    CostCodeOptionsModule,
    SubmissionsModule,
    EmailLogsModule,
    ActivityLogsModule,
    BathroomTypeCostCodesModule,
    UploadModule,
    UsersModule,
    PortfolioModule,
    SiteSettingsModule,
    ContactUsModule,
    HomePageModule,
    AboutUsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PricingService, EmailService, PdfGeneratorService],
})
export class AppModule {}
