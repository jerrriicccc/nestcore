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
import { AppointmentService } from './appointment.service';
import {
  CreateDto,
  UpdateDto,
  AppointmentResponseDto,
} from './dto/appointments.dto';
import { Appointment } from './entity/appointment.entity';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { CategoryTypeService } from 'src/categorytype/categorytype.service';
import { GroomService } from 'src/groomservice/groomservice.service';
import { AppointmentNumberEntity } from 'src/appointmentnumbers/entity/appointmentnumber.entity';
import { getTodayFormatted } from 'src/utils/date.util';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly categoryTypeService: CategoryTypeService,
    private readonly groomService: GroomService,
  ) {}

  @Get('getoption/price')
  async getPrice(
    @Query('size') size: string,
    @Query('type') type: string,
  ): Promise<{ price: number | null }> {
    const price = await this.groomService.getPrice(size, type);
    return { price };
  }

  @Get('getoption/type')
  async getType(
    @Query('size') size: string,
  ): Promise<{ data: { value: number; label: string }[] }> {
    const result = await this.groomService.getTypeOption(size);
    return { data: result };
  }

  @Get('getoption/size')
  async getSize(): Promise<{
    data: { value: number; label: string }[];
  }> {
    const result = await this.groomService.getSizeOption();
    return {
      data: result,
    };
  }

  @Get('getoption/servicecategory')
  async getServiceCategory(): Promise<{
    data: { value: number; label: string }[];
  }> {
    const result = await this.categoryTypeService.getCategoryOption();

    return {
      data: result,
    };
  }

  @Get('getoption/timeschedules')
  async getTimeSched(): Promise<{
    data: { value: string; label: string }[];
  }> {
    const result = await this.appointmentService.getTimeSchedOption();

    return {
      data: result,
    };
  }

  @Get('getloggedbyemail')
  async findByEmail(@Query() query: PaginationQuery, @Req() req: Request) {
    const userEmail = await this.authService.getLoggedInByUser(req);

    if (!userEmail) {
      throw new BadRequestException('User not found');
    }

    const page = Number(query.page) || 1;

    return this.appointmentService.findPaginatedByUser(
      Appointment,
      userEmail,
      page,
    );
  }

  @Get('index')
  async findAll(
    @Query() query: PaginationQuery,
    @Req() req: Request,
  ): Promise<{ data: Array<AppointmentResponseDto> }> {
    const today = getTodayFormatted();

    const result = await this.appointmentService.findAllData(Appointment, {
      appointmentdate: today,
    });

    return { data: result };
  }

  @Get('getcard')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.appointmentService.findOne(Appointment, id);
    return { data: result };
  }

  @Post('newcard')
  async create(@Body() body: any, @Req() req: Request) {
    const userEmail = await this.authService.getLoggedInByUser(req);
    if (!userEmail) {
      throw new BadRequestException('User not found');
    }

    const apnNumber = await this.appointmentService.findAll(
      AppointmentNumberEntity,
    );

    if (!apnNumber.length) {
      throw new Error('No appointment number found');
    }

    const generatedApnNumber =
      await this.appointmentService.getNextAppointmentNumber('APN');

    const isMultiplePets = Array.isArray(body?.appointments);

    // MULTIPLE
    if (isMultiplePets) {
      const appointments = body.appointments;
      for (const appt of appointments) {
        if (
          !appt?.appointmentdate ||
          !appt?.timeid ||
          !appt?.servicecategoryid ||
          !appt?.petname
        ) {
          throw new BadRequestException('Invalid appointment data');
        }
      }

      // Calculate total amount from all pets
      const totalAmount = appointments.reduce(
        (sum, appt) => sum + (Number(appt.price) || 0),
        0,
      );

      const appointmentData = {
        createdby: userEmail,
        appointmentdate: appointments[0].appointmentdate,
        totalamount: totalAmount,
        apnnumber: generatedApnNumber,
      };

      const petEntriesData = appointments.map((appt) => ({
        petname: appt.petname,
        date: appt.appointmentdate,
        timeid: appt.timeid,
        servicecategoryid: appt.servicecategoryid,
        additionalserviceid: appt.additionalserviceid || 0,
        durationid: appt.durationid || 0,
        sizeid: appt.sizeid,
        typeid: appt.typeid,
        price: appt.price,
        apnnumber: generatedApnNumber,
      }));

      const result =
        await this.appointmentService.createAppointmentWithMultiplePets(
          appointmentData,
          petEntriesData,
        );

      return {
        data: {
          appointmentData: result.appointment,
          petEntryData: result.petEntries,
        },
      };
    } else {
      // SINGLE
      const createDto = body;
      const appointmentData = {
        createdby: userEmail,
        appointmentdate: createDto.appointmentdate,
        apnnumber: generatedApnNumber,
        totalamount: Number(createDto.totalamount ?? createDto.price ?? 0),
      };

      const petEntryData = {
        petname: createDto.petname,
        date: createDto.appointmentdate,
        timeid: createDto.timeid,
        servicecategoryid: createDto.servicecategoryid,
        additionalserviceid: createDto.additionalserviceid || 0,
        durationid: createDto.durationid || 0,
        sizeid: createDto.sizeid,
        typeid: createDto.typeid,
        price: createDto.price,
        apnnumber: generatedApnNumber,
      };

      const result = await this.appointmentService.createAppointmentWithDetails(
        appointmentData,
        petEntryData,
      );

      return {
        data: {
          appointmentData: result.appointment,
          petEntryData: result.petEntry,
        },
      };
    }
  }

  @Put('updatecard')
  async update(@Body() updateDto: UpdateDto) {
    if (!updateDto.id) {
      throw new BadRequestException('ID is required for updating');
    }
    const result = await this.appointmentService.update(
      Appointment,
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

    return await this.appointmentService.delete(Appointment, id);
  }

  @Get('available-slots')
  async getAvailableTimes(
    @Query('appointmentdate') appointmentdate: string,
  ): Promise<{ data: number[] }> {
    if (!appointmentdate) {
      throw new BadRequestException('Date is required');
    }
    const result =
      await this.appointmentService.getBookedTimeSlots(appointmentdate);
    return { data: result };
  }
}
