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
import {
  createCurrentDate,
  formattedDate,
  // formattedDate,
} from 'src/utils/date.util';
// import { AppointmentResponseDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentService {
  private readonly DEFAULT_PAGE_LIMIT = 10;

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

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (data: any) => {
        return {
          ...data,
          datecreated: formattedDate(data.datecreated),
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

  private buildSearchQuery(queryBuilder: any, searchCond: string): void {
    if (!searchCond?.trim()) {
      return;
    }

    const conditions = this.parseSearchConditions(searchCond);
    this.applySearchConditions(queryBuilder, conditions);
  }

  private parseSearchConditions(
    searchCond: string,
  ): Array<{ field: string; value: string }> {
    const conditions: Array<{ field: string; value: string }> = [];
    const parts = searchCond.split('|');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex <= 0 || colonIndex >= trimmed.length - 1) continue;

      const field = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (field && value) {
        conditions.push({ field, value });
      }
    }

    return conditions;
  }

  private applySearchConditions(
    queryBuilder: any,
    conditions: Array<{ field: string; value: string }>,
  ): void {
    const whereConditions: string[] = [];
    const parameters: Record<string, any> = {};

    for (let i = 0; i < conditions.length; i++) {
      const { field, value } = conditions[i];
      const paramName = `search${i}`;

      switch (field) {
        case 'lastname':
          whereConditions.push(`appointment.lastname LIKE :${paramName}`);
          parameters[paramName] = `%${value}%`;
          break;

        case 'firstname':
          whereConditions.push(`appointment.firstname LIKE :${paramName}`);
          parameters[paramName] = `%${value}%`;
          break;

        case 'from_datecreated':
          whereConditions.push(
            `DATE(appointment.datecreated) >= :${paramName}`,
          );
          parameters[paramName] = value;
          break;

        case 'to_datecreated':
          whereConditions.push(
            `DATE(appointment.datecreated) <= :${paramName}`,
          );
          parameters[paramName] = value;
          break;
      }
    }

    if (whereConditions.length > 0) {
      queryBuilder.where(`(${whereConditions.join(' AND ')})`, parameters);
    }
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
