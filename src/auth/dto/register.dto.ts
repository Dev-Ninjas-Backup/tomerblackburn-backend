import { ApiProperty } from '@nestjs/swagger';

enum RoleEnum {
  ADMIN,
  USER,
}

export class CreateUserDtos {
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'johnDoe@@722' })
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
