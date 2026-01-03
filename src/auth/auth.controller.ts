import { Body, Controller, Post } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { CreateUserDtos } from './dto/register.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  @Post('registration')
  register(@Body() userData: CreateUserDtos) {
    return { userData };
  }
}
