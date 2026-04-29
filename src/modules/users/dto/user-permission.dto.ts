import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UserPermissionDto {
  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  submissionsView?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  submissionsEdit?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  submissionsDelete?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  contactsView?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  contactsEdit?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  contactsDelete?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  costManagementView?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  costManagementEdit?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  costManagementDelete?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  projectManagementView?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  projectManagementEdit?: boolean;
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  projectManagementDelete?: boolean;

  @ApiProperty({ default: false }) @IsBoolean() @IsOptional() webView?: boolean;
  @ApiProperty({ default: false }) @IsBoolean() @IsOptional() webEdit?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  settingsView?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  dataBackupAccess?: boolean;
}
