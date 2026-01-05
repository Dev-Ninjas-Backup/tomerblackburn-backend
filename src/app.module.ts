import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { BathroomTypesModule } from './modules/bathroom-types/bathroom-types.module';
import { CostCodeCategoriesModule } from './modules/cost-code-categories/cost-code-categories.module';
import { CostCodesModule } from './modules/cost-codes/cost-codes.module';
import { CostCodeOptionsModule } from './modules/cost-code-options/cost-code-options.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { SubmissionItemsModule } from './modules/submission-items/submission-items.module';
import { SubmissionMediaModule } from './modules/submission-media/submission-media.module';
import { CompanySettingsModule } from './modules/company-settings/company-settings.module';
import { EmailLogsModule } from './modules/email-logs/email-logs.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { BathroomTypeCostCodesModule } from './modules/bathroom-type-cost-codes/bathroom-type-cost-codes.module';
import { PricingService } from './modules/pricing/pricing.service';
import { EmailService } from './modules/notifications/email.service';
import { UploadService } from './modules/upload/upload.service';
import { PdfGeneratorService } from './modules/pdf/pdf-generator.service';

@Module({
  imports: [AuthModule, PrismaModule, BathroomTypesModule, CostCodeCategoriesModule, CostCodesModule, CostCodeOptionsModule, SubmissionsModule, SubmissionItemsModule, SubmissionMediaModule, CompanySettingsModule, EmailLogsModule, ActivityLogsModule, BathroomTypeCostCodesModule],
  controllers: [AppController],
  providers: [AppService, PricingService, EmailService, UploadService, PdfGeneratorService],
})
export class AppModule {}
