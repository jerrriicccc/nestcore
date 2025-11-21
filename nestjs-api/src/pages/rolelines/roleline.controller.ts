import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  BadRequestException,
  Query,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { RoleLinesService } from './roleline.service';
import { CreateDto, UpdateDto } from './dto/roleline.dto';
import { RoleLineEntity } from './entity/roleline.entity';
import { plainToInstance } from 'class-transformer';
import { SearchCondDto } from './dto/search-cond.dto';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';
import { Request } from 'express';
import {
  denyRoleBasedAccess,
  hasReadAccess,
  hasUpdateAccess,
} from 'src/component/validateaccess/validate-rbactoken';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('rolelines')
export class RoleLinesController {
  constructor(private readonly roleLinesService: RoleLinesService) {}

  @Get('index')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async findAll(@Query('searchcond') searchcond: string, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    let parsed: any;
    parsed = JSON.parse(searchcond);
    const dto = plainToInstance(SearchCondDto, parsed);

    const data = await this.roleLinesService.findAll(RoleLineEntity, dto);
    return { data };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    // if (!isGranted(req)) {
    //   throw new ForbiddenException(getValidationError(req) || 'Access denied');
    // }
    // if (!hasUpdateAccess(req)) return denyRoleBasedAccess();

    if (!updateDto.id) throw new BadRequestException('No id Found');

    const result = await this.roleLinesService.update(
      RoleLineEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }
}
