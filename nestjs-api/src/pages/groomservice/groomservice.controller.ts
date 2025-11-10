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
import { GroomService } from './groomservice.service';
import { CreateDto, UpdateDto } from './dto/groomservice.dto';
import { GroomServiceEntity } from './entity/groomservice.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CategoryTypeService } from '../categorytype/categorytype.service';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('groomservices')
export class GroomServicesController {
  constructor(
    private readonly groomService: GroomService,
    private readonly serviceTypeService: CategoryTypeService,
  ) {}

  @Get('getoption/servicecategory')
  async getCategoryType(): Promise<{
    data: { value: number; label: string }[];
  }> {
    const result = await this.serviceTypeService.getCategoryOption();

    return {
      data: result,
    };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.groomService.findPaginated(
      GroomServiceEntity,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.groomService.findOne(GroomServiceEntity, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.groomService.create(
      GroomServiceEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.groomService.update(
      GroomServiceEntity,
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

    return await this.groomService.delete(GroomServiceEntity, id);
  }
}
