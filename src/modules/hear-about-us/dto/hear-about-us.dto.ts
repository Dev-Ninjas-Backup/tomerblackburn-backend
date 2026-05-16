import { IsString, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateHearAboutUsOptionDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHearAboutUsOptionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHearAboutUsSettingDto {
  @IsBoolean()
  isEnabled: boolean;
}
