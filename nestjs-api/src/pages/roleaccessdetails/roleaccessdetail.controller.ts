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

  @Get('getoption/:type')
  async getOptionsByType(
    @Param('type') type: string,
  ): Promise<{ data: { value: string; label: string }[] }> {
    const optionsMap: Record<
      string,
      () => Promise<{ value: string; label: string }[]>
    > = {
      roleaccesstypes: () =>
        this.roleAccessTypesService.getRoleAccessTypesOptions(),
      accessoptions: () => this.roleAccessOptionsService.getRoleAccessOptions(),
      // models: () => this.roleAccessDetailsService.getModelsOptions(),
    };

    const getOptionsFn = optionsMap[type];
    const data = await getOptionsFn();
    return { data };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond?.trim() || '';

    return this.roleAccessDetailsService.getMainIndexTable(
      RoleAccessDetailEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const result = await this.roleAccessDetailsService.findOne(
      RoleAccessDetailEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.roleAccessDetailsService.create(
      RoleAccessDetailEntity,
      createDto,
    );
    const getRoleId = await this.rolesService.findAll(RoleEntity);

    // Loop through roles and create RoleLine for each
    for (const getrole of getRoleId) {
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

    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.roleAccessDetailsService.update(
      RoleAccessDetailEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    return this.roleAccessDetailsService.delete(RoleAccessDetailEntity, id);
  }
}
