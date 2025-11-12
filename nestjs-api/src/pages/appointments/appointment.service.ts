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
import { AppointmentEntity } from './entity/appointment.entity';
import { AppointmentNumberEntity } from '../appointmentnumbers/entity/appointmentnumber.entity';
// COMPONENT
import { createCurrentDate, formattedDate } from 'src/utils/date.util';
import { AppointmentResponseDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentService {
  private readonly DEFAULT_PAGE_LIMIT = 3;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(AppointmentEntity)
    @InjectRepository(AppointmentNumberEntity)
    private readonly appointmentNumberRepository: Repository<AppointmentNumberEntity>,
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

    // Remove createdby from update data - it should not be updated by users
    const { createdby, ...updateData } = data as any;

    const updated = repo.merge(existing, updateData);
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

  // async getMainIndexTable(
  //   entity: EntityTarget<Appointment>,
  //   extraWhere: Record<string, any> = {},
  // ): Promise<AppointmentResponseDto[]> {
  //   try {
  //     const repo = this.getRepository(entity);
  //     const queryBuilder = repo.createQueryBuilder('appointment');

  //     for (const key in extraWhere) {
  //       queryBuilder.andWhere(`appointment.${key} = :${key}`, {
  //         [key]: extraWhere[key],
  //       });
  //     }

  //     // Order by id instead of datecreated (which doesn't exist in the entity)
  //     queryBuilder.orderBy('appointment.id', 'ASC');
  //     const data = await queryBuilder.getMany();

  //     // Transform data first
  //     const transformedData = data.map((item) => ({
  //       id: item.id,
  //       createdby: item.createdby,
  //       lastname: item.lastname,
  //       firstname: item.firstname,
  //     }));

  //     // Use the existing resultData method to add pet names
  //     return await this.resultData(transformedData);
  //   } catch (error) {
  //     console.error('Error in getMainIndexTable:', error);
  //     throw new InternalServerErrorException(
  //       `Failed to fetch appointments: ${error?.message || 'Unknown error'}`,
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

  private buildSearchQuery(queryBuilder: any, searchCond: string) {
    queryBuilder;

    if (searchCond) {
      // queryBuilder.where(
      //   '(user.email LIKE :search OR user.phonenumber LIKE :search OR DATE_FORMAT(user.birthdate, "%M %d, %Y") LIKE :search)',
      //   { search: `%${searchCond}%` },
      // );
    }
  }

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (data: any) => {
        return {
          ...data,
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

  async getMainIndexTable(
    entity: EntityTarget<AppointmentEntity>,
    page = 1,
    searchCond = '',
    limit = this.DEFAULT_PAGE_LIMIT,
  ): Promise<{
    data: Array<{ [key: string]: any }>;
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

      this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<AppointmentEntity>(queryBuilder, {
        page: Math.max(1, page),
        limit,
      });

      return {
        data: await this.resultData(result.items),
        meta: this.paginationMeta(result.meta),
      };
    } catch (error) {
      console.error('Error in findPaginated:', error);
      throw new InternalServerErrorException('Failed to fetch paginated data');
    }
  }
}
