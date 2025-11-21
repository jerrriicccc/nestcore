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
import { RolesService } from './role.service';
import { CreateDto, UpdateDto } from './dto/role.dto';
import { RoleEntity } from './entity/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AppointmentStatusEntity } from '../appointmentstatuses/entity/appointmentstatus.entity';

import { getQueryData } from '../../lib/functions';
import { RoleAccessDetailsService } from '../roleaccessdetails/roleaccessdetail.service';
import { RoleAccessDetailEntity } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { In } from 'typeorm';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';
import {
  denyRoleBasedAccess,
  hasCreateAccess,
  hasDeleteAccess,
  hasReadAccess,
  hasUpdateAccess,
} from 'src/component/validateaccess/validate-rbactoken';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly roleAccessDetailsService: RoleAccessDetailsService,
    @InjectRepository(AppointmentStatusEntity)
    private readonly appointmentStatusRepository: Repository<AppointmentStatusEntity>,
  ) {}

  // @Get('getoption/appointmentstatusoptions')
  // async getAppointmentStatusOptions(): Promise<{
  //   data: { value: string; label: string }[];
  // }> {
  //   const result = await this.rolesService.getAppointmentStatusOptions();
  //   console.log('result Options:', result);
  //   return {
  //     data: result,
  //   };
  // }

  @Get('getoptionbyquerystring')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async getOptionsByModel(@Query('model') model: string, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    if (!model) {
      throw new BadRequestException('Model parameter is required');
    }
    switch (model) {
      case 'appointmentstatuses':
        const result = await this.rolesService.getAppointmentStatusOptions();
        return {
          data: result,
        };
      default:
        throw new BadRequestException(`Unsupported model: ${model}`);
    }
  }
  // @Get('get')

  // @Get('getallaccessoptions')
  // async getAllAccessOptions(
  //   @Query() query: PaginationQuery,
  // ): Promise<{ data: Record<string, { value: string; label: string }[]> }> {
  //   let typeid = getQueryData(query, 'typeid', [2, 3]);
  //   if (!Array.isArray(typeid)) {
  //     typeid = [Number(typeid)];
  //   }
  //   const typeidArray = typeid.map((t) => Number(t));
  //   const data = await this.roleAccessDetailRepository.find({
  //     where: { typeid: In(typeidArray) },
  //   });

  //   const result: Record<string, { value: string; label: string }[]> = {};
  //   data.forEach((item) => {
  //     if (!result[item.accesskey]) {
  //       const accessArray = Array.isArray(item.access) ? item.access : [];
  //       result[item.accesskey] = accessArray.map((acc: string) => ({
  //         value: acc,
  //         label: acc,
  //       }));
  //     }
  //   });

  //   return { data: result };
  // }

  @Get('index')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond?.trim() || '';

    return this.rolesService.getMainIndexTable(RoleEntity, page, searchCond);
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    const result = await this.rolesService.findOne(RoleEntity, id);
    return { data: result };
  }

  @Post('newcard')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasCreateAccess(req)) return denyRoleBasedAccess();

    const result = (await this.rolesService.create(
      RoleEntity,
      createDto,
    )) as RoleEntity;
    const accessd = await this.rolesService.getGlobalAccessData(result.id);

    return {
      data: result,
      accessDetails: accessd,
    };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();

    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.rolesService.update(
      RoleEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'roles' })
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasDeleteAccess(req)) return denyRoleBasedAccess();

    return this.rolesService.delete(RoleEntity, id);
  }
}
