import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  ObjectLiteral,
  EntityTarget,
  DeepPartial,
} from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
// ENTITY
import { Appointment } from './entity/appointment.entity';
import { TimeScheduleEntity } from '../timeschedule/entity/timeschedule.entity';
import { GroomServiceEntity } from '../groomservice/entity/groomservice.entity';
import { PetEntryLineEntity } from '../petentrylines/entity/petentryline.entity';
import { AppointmentNumberEntity } from '../appointmentnumbers/entity/appointmentnumber.entity';
// COMPONENT
import { createCurrentDate, formattedDate } from 'src/utils/date.util';
import { AppointmentResponseDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentService {
  private readonly DEFAULT_PAGE_LIMIT = 15;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Appointment)
    @InjectRepository(TimeScheduleEntity)
    private readonly timeScheduleRepository: Repository<TimeScheduleEntity>,
    @InjectRepository(GroomServiceEntity)
    @InjectRepository(AppointmentNumberEntity)
    private readonly appointmentNumberRepository: Repository<AppointmentNumberEntity>,
    @InjectRepository(PetEntryLineEntity)
    private readonly petEntryLineEntity: Repository<PetEntryLineEntity>,
  ) {}

  private getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    try {
      return this.dataSource.getRepository<T>(entity);
    } catch (error) {
      throw new Error(`Repository for entity '${entity}' not found.`);
    }
  }

  async createAppointmentWithDetails(
    appointmentData: Partial<Appointment>,
    petEntryData: Partial<PetEntryLineEntity>,
  ): Promise<{ appointment: Appointment; petEntry: PetEntryLineEntity }> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const appointment = await manager.save(Appointment, appointmentData);

        const petEntry = await manager.save(PetEntryLineEntity, {
          ...petEntryData,
        });

        return { appointment, petEntry };
      });
    } catch (error) {
      console.error('Error creating appointment with details:', error);
      throw new InternalServerErrorException(
        'Failed to create appointment and pet entry',
      );
    }
  }

  async createAppointmentWithMultiplePets(
    appointmentData: Partial<Appointment>,
    petEntriesData: Partial<PetEntryLineEntity>[],
  ): Promise<{ appointment: Appointment; petEntries: PetEntryLineEntity[] }> {
    const date = new Date();
    try {
      return await this.dataSource.transaction(async (manager) => {
        // Create the main appointment record
        const appointment = await manager.save(Appointment, {
          ...appointmentData,
          quantity: petEntriesData.length > 0 ? petEntriesData.length : 0,
          datecreated: createCurrentDate(date),
        });

        // Create all pet entry records
        const petEntries: PetEntryLineEntity[] = []; // Explicitly type the array
        for (const petData of petEntriesData) {
          const petEntry = await manager.save(PetEntryLineEntity, {
            ...petData,
            appointmentid: appointment.id, // Link to the appointment
          });
          petEntries.push(petEntry);
        }

        return { appointment, petEntries };
      });
    } catch (error) {
      console.error('Error creating appointment with multiple pets:', error);
      throw new InternalServerErrorException(
        'Failed to create appointment and pet entries',
      );
    }
  }

  async getTimeSchedOption(): Promise<{ value: string; label: string }[]> {
    const list = await this.timeScheduleRepository.find();
    return list.map((data) => ({
      value: String(data.id),
      label: data.timeschedule,
    }));
  }

  async create<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    data: DeepPartial<T>,
  ) {
    const repo = this.getRepository(entity);
    const result = repo.create(data);
    return await repo.save(result);
  }

  async findAll<T extends ObjectLiteral>(entity: EntityTarget<T>) {
    return await this.getRepository(entity).find();
  }

  async findOne<T extends ObjectLiteral>(entity: EntityTarget<T>, id: number) {
    if (!id) throw new Error('ID is required');
    const repo = this.getRepository(entity);
    const data = await repo.findOneBy({ id } as any);
    if (!data) throw new NotFoundException(`Item with ID ${id} not found`);
    return data;
  }

  async update<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    id: number,
    data: DeepPartial<T>,
  ) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const repo = this.getRepository(entity);
    const existing = await repo.findOne({ where: { id } as any });

    if (!existing) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    const updated = repo.merge(existing, data);
    return await repo.save(updated);
  }

  async delete<T extends ObjectLiteral>(entity: EntityTarget<T>, id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const repo = this.getRepository(entity);
    const data = await repo.findOne({ where: { id } as any });

    if (!data) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    await repo.delete(id);
    return { message: `Record with ID ${id} deleted successfully` };
  }

  async getPetName(apnnumber: string): Promise<string> {
    const petName = await this.petEntryLineEntity.findOne({
      where: { apnnumber: apnnumber },
    });
    return petName ? petName.petname : '';
  }

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (data: any) => {
        const petName = await this.getPetName(data.apnnumber);
        return {
          ...data,
          petName,
        };
      }),
    );
    return result;
  }

  private paginationMeta(meta: any) {
    return {
      datacount: meta.itemCount,
      pagelimit: meta.itemsPerPage,
      page: meta.currentPage,
      totalpages: Math.max(1, meta.totalPages || 1),
    };
  }

  async getByUser(
    entity: EntityTarget<Appointment>,
    userEmail: string,
    page = 1,
    limit = this.DEFAULT_PAGE_LIMIT,
  ): Promise<{
    data: AppointmentResponseDto[];
    meta: {
      datacount: number;
      pagelimit: number;
      page: number;
      totalpages: number;
    };
  }> {
    try {
      const repo = this.getRepository(entity);
      const queryBuilder = repo.createQueryBuilder('appointment');

      queryBuilder.andWhere(`appointment.createdby = :createdby`, {
        createdby: userEmail,
      });

      const result = await paginate<Appointment>(queryBuilder, {
        page: Math.max(1, page),
        limit,
      });

      const transformedData = result.items.map((item) => ({
        id: item.id,
        createdby: item.createdby,
        lastname: item.lastname,
        firstname: item.firstname,
      }));

      return {
        data: await this.resultData(transformedData),
        meta: this.paginationMeta(result.meta),
      };
    } catch (error) {
      console.error('Error in findPaginatedByUser:', error);
      throw new InternalServerErrorException('Failed to fetch paginated data');
    }
  }

  async getMainIndexTable(
    entity: EntityTarget<Appointment>,
    extraWhere: Record<string, any> = {},
  ): Promise<AppointmentResponseDto[]> {
    const repo = this.getRepository(entity);
    const queryBuilder = repo.createQueryBuilder('appointment');

    for (const key in extraWhere) {
      queryBuilder.andWhere(`appointment.${key} = :${key}`, {
        [key]: extraWhere[key],
      });
    }

    queryBuilder.orderBy('appointment.datecreated', 'ASC');
    const data = await queryBuilder.getMany();

    // Transform data first
    const transformedData = data.map((item) => ({
      id: item.id,
      createdby: item.createdby,
      lastname: item.lastname,
      firstname: item.firstname,
    }));

    // Use the existing resultData method to add pet names
    return await this.resultData(transformedData);
  }

  // async getBookedTimeSlots(appointmentdate: string): Promise<number[]> {
  //   try {
  //     const queryBuilder = this.dataSource
  //       .getRepository(PetEntryLineEntity)
  //       .createQueryBuilder('petEntry')
  //       .select('DISTINCT petEntry.timeid', 'timeid')
  //       .where('petEntry.date = :appointmentdate', {
  //         appointmentdate,
  //       })
  //       .andWhere('petEntry.timeid > 0'); // Only get valid time IDs

  //     const result = await queryBuilder.getRawMany();

  //     const bookedTimeSlots = result.map((item) => item.timeid);

  //     return bookedTimeSlots;
  //   } catch (error) {
  //     console.error('Error getting booked time slots:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to fetch booked time slots',
  //     );
  //   }
  // }

  async getNextAppointmentNumber(prefix: string): Promise<string> {
    const result = await this.appointmentNumberRepository.findOne({
      where: { prefix },
    });

    if (!result) {
      throw new BadRequestException(
        `No appointment number found for prefix ${prefix}`,
      );
    }

    // Generate next appointment number
    const nextNumber = `${result.prefix} ${result.nextid + 1}`;

    // Update the nextid in DB
    result.nextid += 1;
    await this.appointmentNumberRepository.save(result);

    return nextNumber;
  }
}
