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
import { CustomersService } from './customer.service';
import { CreateDto, UpdateDto } from './dto/customer.dto';
import { Customer } from './entity/customers.entity';
import { ValidateAccessService } from '../lib/validate-access.service';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly validateAccessService: ValidateAccessService,
  ) {}

  @Get('getoption/verifystatuses')
  async getVerifyStatuses(): Promise<{
    data: { value: string; label: string }[];
  }> {
    const result = await this.customersService.getVerifyStatusesOptions();

    return {
      data: result,
    };
  }

  @Get('index')
  async findAll(@Query() query: PaginationQuery, @Req() req: Request) {
    // this.validateAccessService.check((req as any).user, [1]);
    const page = Number(query.page) || 1;
    const searchCond = query.searchcond || '';

    return await this.customersService.findPaginated(
      Customer,
      page,
      searchCond,
    );
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.customersService.findOne(Customer, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() createDto: CreateDto) {
    const result = await this.customersService.create(Customer, createDto);
    return { data: result };
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.customersService.update(
      Customer,
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

    return await this.customersService.delete(Customer, id);
  }
}
