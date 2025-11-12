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
  HttpCode,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateDto, UpdateDto } from './dto/appointments.dto';
import { AppointmentEntity } from './entity/appointment.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { getTodayFormatted } from 'src/utils/date.util';
import {
  denyRoleBasedAccess,
  hasCreateAccess,
  hasDeleteAccess,
  hasReadAccess,
  hasUpdateAccess,
} from 'src/component/validateaccess/RbacToken';
import { ValidateAccessMethod } from 'src/component/validateaccess/validate-access.decorator';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}
@UseGuards(AuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
  ) {}

  @Get('index')
  @HttpCode(200)
  @ValidateAccessMethod({ RBACModule: 'appointments' })
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';
    const result = await this.appointmentService.getMainIndexTable(
      AppointmentEntity,
      page,
      searchCond,
    );
    return result;
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'appointments' })
  async findOne(@Query('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!hasReadAccess(req)) return denyRoleBasedAccess();
    if (!id) throw new BadRequestException('No id Found');

    const result = await this.appointmentService.findOne(AppointmentEntity, id);
    return { data: result };
  }

  @Post('newcard')
  @ValidateAccessMethod({ RBACModule: 'appointments' })
  @HttpCode(201)
  async create(@Body() createDto: CreateDto, @Req() req: Request) {
    if (!hasCreateAccess(req)) return denyRoleBasedAccess();

    const result = await this.appointmentService.create(
      AppointmentEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'appointments' })
  @HttpCode(200)
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();
    if (!updateDto.id) throw new BadRequestException('No id Found');

    const result = await this.appointmentService.update(
      AppointmentEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  @ValidateAccessMethod({ RBACModule: 'appointments' })
  @HttpCode(200)
  async delete(@Body('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (!hasDeleteAccess(req)) return denyRoleBasedAccess();
    if (!id) throw new BadRequestException('No id Found');

    await this.appointmentService.delete(AppointmentEntity, id);
    return { message: 'Deleted successfully', id };
  }
}
