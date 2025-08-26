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
import { TimeScheduleService } from './timeschedule.service';
import { CreateDto, UpdateDto } from './dto/timeschedule.dto';
import { TimeScheduleEntity } from './entity/timeschedule.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('timeschedules')
export class TimeSchedulesController {
  constructor(private readonly timeScheduleService: TimeScheduleService) {}

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.timeScheduleService.findPaginated(
      TimeScheduleEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.timeScheduleService.findOne(
      TimeScheduleEntity,
      id,
    );
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.timeScheduleService.create(
      TimeScheduleEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.timeScheduleService.update(
      TimeScheduleEntity,
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

    return await this.timeScheduleService.delete(TimeScheduleEntity, id);
  }
}
