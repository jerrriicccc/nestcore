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
import { AppointmentSettingService } from './appointmentsetting.service';
import { CreateDto, UpdateDto } from './dto/appointmentsetting.dto';
import { AppointmentSettingEntity } from './entity/appointmentsetting.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('appointmentsettings')
export class AppointmentSettingsController {
  constructor(
    private readonly appointmentSettingService: AppointmentSettingService,
  ) {}

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.appointmentSettingService.getMainIndexTable(
      AppointmentSettingEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.appointmentSettingService.findOne(
      AppointmentSettingEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.appointmentSettingService.create(
      AppointmentSettingEntity,
      createDto as any,
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.appointmentSettingService.update(
      AppointmentSettingEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required in the request body');
    }

    return await this.appointmentSettingService.delete(
      AppointmentSettingEntity,
      id,
    );
  }
}
