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
import { AppointmentNumberService } from './appointmentnumber.service';
import { CreateDto, UpdateDto } from './dto/appointmentnumber.dto';
import { AppointmentNumberEntity } from './entity/appointmentnumber.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('appointmentnumbers')
export class AppointmentNumberController {
  constructor(
    private readonly appointmentNumberService: AppointmentNumberService,
  ) {}

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.appointmentNumberService.getMainIndexTable(
      AppointmentNumberEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.appointmentNumberService.findOne(
      AppointmentNumberEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.appointmentNumberService.create(
      AppointmentNumberEntity,
      { ...createDto, nextid: createDto.startseries },
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.appointmentNumberService.update(
      AppointmentNumberEntity,
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

    return await this.appointmentNumberService.delete(
      AppointmentNumberEntity,
      id,
    );
  }
}
