import { Controller } from '@nestjs/common';
import { RoleAccessTypesService } from './roleaccesstype.service';

@Controller('roleaccesstypes')
export class RoleAccessTypesController {
  constructor(
    private readonly roleAccessTypesService: RoleAccessTypesService,
  ) {}
}
