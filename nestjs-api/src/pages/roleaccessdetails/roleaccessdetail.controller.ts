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
  Param,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { RoleAccessDetailsService } from './roleaccessdetail.service';
import { CreateDto, UpdateDto } from './dto/roleaccessdetail.dto';
import { RoleAccessDetailEntity } from './entity/roleaccessdetail.entity';
import { RoleAccessTypesService } from 'src/pages/roleaccesstypes/roleaccesstype.service';
import { RoleAccessOptionsService } from 'src/pages/roleaccessoptions/roleaccessoption.service';
import { CreateDto as CreateRoleLineDto } from 'src/pages/rolelines/dto/roleline.dto';
import { RoleLineEntity } from '../rolelines/entity/roleline.entity';
import { RoleLinesService } from 'src/pages/rolelines/roleline.service';
import { RolesService } from '../roles/role.service';
import { RoleEntity } from '../roles/entity/role.entity';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';
import { Request } from 'express';
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

@Controller('roleaccessdetails')
export class RoleAccessDetailsController {
  constructor(
    private readonly roleAccessDetailsService: RoleAccessDetailsService,
    private readonly roleAccessTypesService: RoleAccessTypesService,
    private readonly roleAccessOptionsService: RoleAccessOptionsService,
    private readonly roleLineService: RoleLinesService,
    private readonly rolesService: RolesService,
  ) {}

  @Get('getoption/:labelName')
  async getOptionsByType(
    @Param('labelName') labelName: string,
  ): Promise<{ data: { value: string; label: string }[] }> {
    const optionsMap: Record<
      string,
      () => Promise<{ value: string; label: string }[]>
    > = {
      getroleaccesstypes: () =>
        this.roleAccessTypesService.getRoleAccessTypesOptions(),
      getaccessoptions: () =>
        this.roleAccessOptionsService.getRoleAccessOptions(),
      getmodels: () => this.roleAccessDetailsService.getModelsOptions(),
    };

    const getOptionsFn = optionsMap[labelName];
    const data = await getOptionsFn();
    return { data };
  }

  @Get('index')
  @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    const page = Number(query.page) || 1;
    const searchCond = query.searchcond?.trim() || '';

    return this.roleAccessDetailsService.getMainIndexTable(
      RoleAccessDetailEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    const result = await this.roleAccessDetailsService.findOne(
      RoleAccessDetailEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasCreateAccess(req)) return denyRoleBasedAccess();

    const result = await this.roleAccessDetailsService.create(
      RoleAccessDetailEntity,
      createDto,
    );
    const getRoleId = await this.rolesService.findAll(RoleEntity);

    for (const getrole of getRoleId) {
      if (result.typeid === 2 && result.models && result.models.length > 0) {
        for (const model of result.models) {
          const createRoleLineDto: CreateRoleLineDto = {
            roleid: getrole.id,
            typeid: result.typeid,
            accesskey: result.accesskey,
            parentkey: model,
            accessvalue: [],
            grantypeid: 0,
          };
          await this.roleLineService.create(RoleLineEntity, createRoleLineDto);
        }
      } else {
        const createRoleLineDto: CreateRoleLineDto = {
          roleid: getrole.id,
          typeid: result.typeid,
          accesskey: result.accesskey || '',
          parentkey: '',
          accessvalue: [],
          grantypeid: 0,
        };
        await this.roleLineService.create(RoleLineEntity, createRoleLineDto);
      }
    }

    return { data: result };
  }

  // @Post('newcard')
  // @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  // async create(@Body() createDto: CreateDto, @Req() req: Request) {
  //   if (!isGranted(req)) {
  //     throw new ForbiddenException(getValidationError(req) || 'Access denied');
  //   }
  //   if (!hasCreateAccess(req)) return denyRoleBasedAccess();

  //   const result = await this.roleAccessDetailsService.create(
  //     RoleAccessDetailEntity,
  //     createDto,
  //   );

  //   // Delegate role line creation to service
  //   await this.distributeNewAccessToAllRoles(result['id']);

  //   return { data: result };
  // }

  private async distributeNewAccessToAllRoles(
    roleAccessDetail: RoleAccessDetailEntity,
  ): Promise<void> {
    const roles = await this.rolesService.findAll(RoleEntity);

    const createRoleLinePromises = roles.map((role) => {
      const createRoleLineDto: CreateRoleLineDto = {
        roleid: role.id,
        typeid: roleAccessDetail.typeid,
        accesskey: roleAccessDetail.accesskey || '',
        parentkey: '',
        accessvalue: [],
        grantypeid: 0,
      };
      return this.roleLineService.create(RoleLineEntity, createRoleLineDto);
    });

    // Execute all creates in parallel for better performance
    await Promise.all(createRoleLinePromises);
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();

    if (!updateDto.id) throw new BadRequestException('No id Found');
    const result = await this.roleAccessDetailsService.update(
      RoleAccessDetailEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'roleaccessdetails' })
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasDeleteAccess(req)) return denyRoleBasedAccess();
    return this.roleAccessDetailsService.delete(RoleAccessDetailEntity, id);
  }
}
