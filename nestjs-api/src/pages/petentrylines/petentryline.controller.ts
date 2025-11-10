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
import { PetEntryLineService } from './petentryline.service';
import { CreateDtoPetEntryLine } from './dto/petentryline.dto';
import { PetEntryLineEntity } from './entity/petentryline.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('petentrylines')
export class PetEntryLineController {
  constructor(private readonly petEntryLineService: PetEntryLineService) {}

  // @Post('newcard')
  // async create(@Body() createDto: CreateDto, @Req() req: Request) {
  //   const result = await this.petEntryLineService.create(PetEntryLineEntity, {
  //     ...createDto,
  //   });

  //   return { data: result };
  // }
}
