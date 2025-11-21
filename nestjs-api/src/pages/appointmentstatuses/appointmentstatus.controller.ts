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
  UseGuards,
} from '@nestjs/common';
import { AppointmentStatusService } from './appointmentstatus.service';
import { CreateDto, UpdateDto } from './dto/appointmentstatus.dto';
import { AppointmentStatusEntity } from './entity/appointmentstatus.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { ValidateAccessMethod } from 'src/component/validateaccess/validate-access.decorator';
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

@UseGuards(AuthGuard)
@Controller('appointmentstatuses')
export class AppointmentStatusesController {
  constructor(
    private readonly appointmentStatusService: AppointmentStatusService,
  ) {}

  @Get('index')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.appointmentStatusService.getMainIndexTable(
      AppointmentStatusEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.appointmentStatusService.findOne(
      AppointmentStatusEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    if (!hasCreateAccess(req)) return denyRoleBasedAccess();

    const result = await this.appointmentStatusService.create(
      AppointmentStatusEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.appointmentStatusService.update(
      AppointmentStatusEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!hasDeleteAccess(req)) return denyRoleBasedAccess();
    if (!id) {
      throw new BadRequestException('ID is required in the request body');
    }

    return await this.appointmentStatusService.delete(
      AppointmentStatusEntity,
      id,
    );
  }
}
