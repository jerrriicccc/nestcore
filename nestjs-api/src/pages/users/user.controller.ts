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
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDto, UpdateDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';
import { RolesService } from '../roles/role.service';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';
import { Request } from 'express';
import {
  denyRoleBasedAccess,
  hasReadAccess,
} from 'src/component/validateaccess/validate-rbactoken';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RolesService,
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
  @ValidateAccessMethod({ RBACModule: 'users' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    const searchCond = query.searchcond || '';

    return await this.userService.getMainIndexTable(
      UserEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'users' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    const result = await this.userService.findOne(UserEntity, id);
    return { data: result };
  }

  // @Post('newcard')
  // @ValidateAccessMethod({ RBACModule: 'users' })
  // async create(@Body() createDto: CreateDto, @Req() req: Request) {
  //   if (!isGranted(req)) {
  //     throw new ForbiddenException(getValidationError(req) || 'Access denied');
  //   }
  //   if (!hasReadAccess(req)) return denyRoleBasedAccess();
  //   const result = await this.userService.create(createDto);
  //   return { data: result };
  // }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'users' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    const result = await this.userService.update(updateDto.id, updateDto);

    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'users' })
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    return await this.userService.delete(id);
  }
}
