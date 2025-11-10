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
import { DaycareService } from './daycareservice.service';
import { CreateDto, UpdateDto } from './dto/daycareservice.dto';
import { DaycareServiceEntity } from './entity/daycareservice.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CategoryTypeService } from '../categorytype/categorytype.service';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('daycareservices')
export class DaycareServicesController {
  constructor(
    private readonly daycareService: DaycareService,
    private readonly categoryTypeService: CategoryTypeService,
  ) {}

  @Get('getoption/servicecategory')
  async getServiceType(): Promise<{
    data: { value: number; label: string }[];
  }> {
    const result = await this.categoryTypeService.getCategoryOption();

    return {
      data: result,
    };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.daycareService.findPaginated(
      DaycareServiceEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.daycareService.findOne(DaycareServiceEntity, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.daycareService.create(
      DaycareServiceEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.daycareService.update(
      DaycareServiceEntity,
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

    return await this.daycareService.delete(DaycareServiceEntity, id);
  }
}
