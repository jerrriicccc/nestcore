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
} from '@nestjs/common';
import { RolesService } from './role.service';
import { CreateDto, UpdateDto } from './dto/role.dto';
import { Role } from './entity/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { getQueryData } from '../../lib/functions';
import { RoleAccessDetailsService } from '../roleaccessdetails/roleaccessdetail.service';
import { RoleAccessDetailEntity } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { In } from 'typeorm';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly roleAccessDetailsService: RoleAccessDetailsService,
    @InjectRepository(RoleAccessDetailEntity)
    private readonly roleAccessDetailRepository: Repository<RoleAccessDetailEntity>,
  ) {}

  @Get('getallaccessoptions')
  async getAllAccessOptions(
    @Query() query: PaginationQuery,
  ): Promise<{ data: Record<string, { value: string; label: string }[]> }> {
    let typeid = getQueryData(query, 'typeid', [2, 3]);
    if (!Array.isArray(typeid)) {
      typeid = [Number(typeid)];
    }
    const typeidArray = typeid.map((t) => Number(t));
    const data = await this.roleAccessDetailRepository.find({
      where: { typeid: In(typeidArray) },
    });

    const result: Record<string, { value: string; label: string }[]> = {};
    data.forEach((item) => {
      if (!result[item.accesskey]) {
        const accessArray = Array.isArray(item.access) ? item.access : [];
        result[item.accesskey] = accessArray.map((acc: string) => ({
          value: acc,
          label: acc,
        }));
      }
    });

    return { data: result };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond?.trim() || '';

    return this.rolesService.findPaginated(Role, page, searchCond);
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const result = await this.rolesService.findOne(Role, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    // RBAC: Only SUPER-ADMIN can access this endpoint
    // this.validateAccessService.check((req as any).user, [1]); // 1 = SUPER-ADMIN
    const result = (await this.rolesService.create(Role, createDto)) as Role;
    const accessd = await this.rolesService.getGlobalAccessData(result.id);

    return {
      data: result,
      accessDetails: accessd,
    };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.rolesService.update(
      Role,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    return this.rolesService.delete(Role, id);
  }
}
