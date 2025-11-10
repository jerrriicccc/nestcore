import { Controller } from '@nestjs/common';
import { RoleAccessOptionsService } from './roleaccessoption.service';

@Controller('roleaccessoptions')
export class RoleAccessOptionsController {
  constructor(
    private readonly roleAccessOptionsService: RoleAccessOptionsService,
  ) {}
}
