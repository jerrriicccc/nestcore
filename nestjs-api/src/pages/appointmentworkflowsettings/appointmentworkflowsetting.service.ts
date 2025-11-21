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
  In,
} from 'typeorm';
import { AppointmentWorkflowSettingEntity } from './entity/appointmentworkflowsetting.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { AppointmentStatusEntity } from '../appointmentstatuses/entity/appointmentstatus.entity';

@Injectable()
export class AppointmentWorkflowSettingService {
  private readonly DEFAULT_PAGE_LIMIT = 15;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(AppointmentWorkflowSettingEntity)
    private readonly appointmentNumberRepository: Repository<AppointmentWorkflowSettingEntity>,
    @InjectRepository(AppointmentStatusEntity)
    private readonly appointmentStatusRepository: Repository<AppointmentStatusEntity>,
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

  async getAppointmentStatusOptions(): Promise<
    { value: string; label: string }[]
  > {
    const data = await this.appointmentStatusRepository.find();
    return data.map((data) => ({
      value: data.id.toString(),
      label: data.status,
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

  async getMainIndexTable(
    entity: EntityTarget<AppointmentStatusEntity>,
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
      const queryBuilder = repo.createQueryBuilder(
        'appointmentworkflowsettings',
      );

      // for searching
      // this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<AppointmentStatusEntity>(queryBuilder, {
        page: Math.max(1, page),
        limit,
      });

      return {
        data: await this.resultData(result.items),
        meta: this.paginationMeta(result.meta),
      };
    } catch (error) {
      console.error('Error in getMainIndexTable:', error);
      throw new InternalServerErrorException('Failed to fetch paginated data');
    }
  }

  private async resultData(data: AppointmentStatusEntity[]) {
    const result = await Promise.all(
      data.map(async (data: any) => {
        const statusName = await this.getStatusName(data.statusid);
        const linkedStatName = await this.getLinkedStatusName(
          data.linkedstatuses,
        );

        return {
          id: data.id,
          ...data,
          statusName: statusName,
          LSNames: linkedStatName.join(', '),
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

  private async getStatusName(statusid: number): Promise<string> {
    const repo = this.getRepository(AppointmentStatusEntity);
    const status = await repo.findOne({ where: { id: statusid } as any });
    const result = status?.status || 'Unknown';
    return result;
  }

  private async getLinkedStatusName(
    linkedstatuses: string[],
  ): Promise<string[]> {
    const options = await this.appointmentStatusRepository.find({
      where: { id: In(linkedstatuses.map((id) => parseInt(id))) },
    });
    const optionMap = new Map(
      options.map((option) => [option.id, option.status]),
    );

    return linkedstatuses.map((id) => optionMap.get(parseInt(id)) || 'Unknown');
  }
}
