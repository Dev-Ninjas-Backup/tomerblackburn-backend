import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrivacyPolicyService } from './privacy-policy.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@ApiTags('Privacy Policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @Get()
  @ApiOperation({ summary: 'Get privacy policy' })
  get() {
    return this.privacyPolicyService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update privacy policy' })
  createOrUpdate(@Body() createPrivacyPolicyDto: CreatePrivacyPolicyDto) {
    return this.privacyPolicyService.createOrUpdate(createPrivacyPolicyDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update privacy policy' })
  update(@Body() updatePrivacyPolicyDto: UpdatePrivacyPolicyDto) {
    return this.privacyPolicyService.createOrUpdate(updatePrivacyPolicyDto);
  }
}
