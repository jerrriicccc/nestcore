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
import { UserStatusesService } from './userstatuses.service';
import { CreateDto, UpdateDto } from './dto/userstatuses.dto';
import { UserStatus } from './entity/userstatuses.entity';

@Controller('userstatuses')
export class UserStatusesController {
  constructor(private readonly userStatusesService: UserStatusesService) {}

  @Get('index')
  async findAll() {
    return this.userStatusesService.findAll(UserStatus);
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const result = await this.userStatusesService.findOne(UserStatus, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.userStatusesService.create(UserStatus, createDto);
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }

    const result = await this.userStatusesService.update(
      UserStatus,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }

  @Delete('deletecard')
  async delete(@Body('id', ParseIntPipe) id: number) {
    return this.userStatusesService.delete(UserStatus, id);
  }
}
