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
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { AppointmentWorkflowSettingService } from './appointmentworkflowsetting.service';
import { CreateDto, UpdateDto } from './dto/appointmentworkflowsetting.dto';
import { AppointmentWorkflowSettingEntity } from './entity/appointmentworkflowsetting.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import {
  denyRoleBasedAccess,
  hasCreateAccess,
  hasDeleteAccess,
  hasReadAccess,
  hasUpdateAccess,
} from 'src/component/validateaccess/validate-rbactoken';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('appointmentworkflowsettings')
export class AppointmentWorkflowSettingController {
  constructor(
    private readonly appointmentWorkflowSettingService: AppointmentWorkflowSettingService,
    private readonly appointmentStatusService: AppointmentWorkflowSettingService,
  ) {}

  @Get('getoption/:status')
  async getOptionsByStatus(
    @Param('status') status: string,
  ): Promise<{ data: { value: string; label: string }[] }> {
    const optionsMap: Record<
      string,
      () => Promise<{ value: string; label: string }[]>
    > = {
      appointmentstatus: () =>
        this.appointmentStatusService.getAppointmentStatusOptions(),
    };
    const getOptionsFn = optionsMap[status];
    const data = await getOptionsFn();
    return { data };
  }

  @Get('index')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.appointmentWorkflowSettingService.getMainIndexTable(
      AppointmentWorkflowSettingEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.appointmentWorkflowSettingService.findOne(
      AppointmentWorkflowSettingEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasCreateAccess(req)) return denyRoleBasedAccess();

    const result = await this.appointmentWorkflowSettingService.create(
      AppointmentWorkflowSettingEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();

    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.appointmentWorkflowSettingService.update(
      AppointmentWorkflowSettingEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'appointmentworkflowsettings' })
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasDeleteAccess(req)) return denyRoleBasedAccess();

    if (!id) {
      throw new BadRequestException('ID is required in the request body');
    }

    return await this.appointmentWorkflowSettingService.delete(
      AppointmentWorkflowSettingEntity,
      id,
    );
  }
}
