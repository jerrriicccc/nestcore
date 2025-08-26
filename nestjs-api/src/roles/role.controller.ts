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
import { Request } from 'express';
import { ValidateAccessService } from '../lib/validate-access.service';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly validateAccessService: ValidateAccessService,
  ) {}

  @Get('getoption/customeroptions')
  async getCustomerOptions(): Promise<{
    data: { value: string; label: string }[];
  }> {
    const result = await this.rolesService.getCustomerOptions();
    console.log('result Options:', result);
    return {
      data: result,
    };
  }

  @Get('getoptionbyquerystring')
  async getOptionsByModel(@Query('model') model: string) {
    console.log('getOptionsByModel called with model:', model);
    if (!model) {
      throw new BadRequestException('Model parameter is required');
    }
    switch (model.toLowerCase()) {
      case 'customer':
        const result = await this.rolesService.getCustomerOptions();
        return {
          data: result,
        };
      default:
        throw new BadRequestException(`Unsupported model: ${model}`);
    }
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
