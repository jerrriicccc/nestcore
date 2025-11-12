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
} from '@nestjs/common';
import { RoleLinesService } from './roleline.service';
import { CreateDto, UpdateDto } from './dto/roleline.dto';
import { RoleLineEntity } from './entity/roleline.entity';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchCondDto } from './dto/search-cond.dto';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@Controller('rolelines')
export class RoleLinesController {
  constructor(private readonly roleLinesService: RoleLinesService) {}

  // @Get('index')
  // async findAll() {
  //   const data = await this.roleLinesService.findAll(RoleLine);
  //   console.log('Data fetched from RoleLinesController:', data);
  //   return data;
  // }

  // @Get('index')
  // async findAll() {
  //   const data = await this.roleLinesService.findAll(RoleLine, { typeid: 1 });
  //   return data;
  // }

  // @Get('index')
  // async findAll(@Query('roleid', ParseIntPipe) roleid: number) {
  //   const data = await this.roleLinesService.findAll(RoleLine, {
  //     typeid: 1,
  //     roleid: roleid,
  //   });
  //   return data;
  // }

  @Get('index')
  async findAll(@Query('searchcond') searchcond: string) {
    let parsed: any;
    parsed = JSON.parse(searchcond);
    const dto = plainToInstance(SearchCondDto, parsed);

    const data = await this.roleLinesService.findAll(RoleLineEntity, dto);
    return { data };
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const result = await this.roleLinesService.findOne(RoleLineEntity, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.roleLinesService.create(
      RoleLineEntity,
      createDto,
    );
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.roleLinesService.update(
      RoleLineEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    return this.roleLinesService.delete(RoleLineEntity, id);
  }
}
