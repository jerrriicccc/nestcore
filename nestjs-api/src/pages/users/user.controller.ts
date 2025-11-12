import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDto, UpdateDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';
import { RolesService } from '../roles/role.service';
import { Request } from 'express';
import { ValidateAccessService } from '../../component/validateaccess/ValidateAccessComponent';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RolesService,
    private readonly validateAccessService: ValidateAccessService,
  ) {}

  @Get('getoption/:type')
  async getOptionsByType(
    @Param('type') type: string,
  ): Promise<{ data: { value: string; label: string }[] }> {
    const optionsMap: Record<
      string,
      () => Promise<{ value: string; label: string }[]>
    > = {
      roles: () => this.roleService.getRoleNameOptions(),
    };

    const getOptionsFn = optionsMap[type];
    const data = await getOptionsFn();
    return { data };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.userService.getMainIndexTable(
      UserEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const result = await this.userService.findOne(UserEntity, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.userService.create(createDto);
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    const result = await this.userService.update(updateDto.id, updateDto);
    console.log('Update result:', result);
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
