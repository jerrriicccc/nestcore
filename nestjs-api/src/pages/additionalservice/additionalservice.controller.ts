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
import { AdditionalService } from './additionalservice.service';
import { CreateDto, UpdateDto } from './dto/additionalservice.dto';
import { AdditionalServiceEntity } from './entity/additionalservice.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('additionalservices')
export class AdditionalServicesController {
  constructor(private readonly additionalService: AdditionalService) {}

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.additionalService.findPaginated(page, searchCond);
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.additionalService.findOne(id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.additionalService.create(createDto);
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.additionalService.update(updateDto.id, updateDto);
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required in the request body');
    }

    return await this.additionalService.delete(id);
  }
}
