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
import { Customer } from './entity/customers.entity';
import { UserStatus } from '../userstatuses/entity/userstatuses.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { RoleAccessDetailEntity } from 'src/pages/roleaccessdetails/entity/roleaccessdetail.entity';

@Injectable()
export class CustomersService {
  private readonly DEFAULT_PAGE_LIMIT = 5;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(UserStatus)
    private readonly userStatusRepository: Repository<UserStatus>,
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

  async getVerifyStatusesOptions(): Promise<
    { value: string; label: string }[]
  > {
    const list = await this.userStatusRepository.find();
    return list.map((item) => ({
      value: String(item.id),
      label: item.status,
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

  private buildSearchQuery(queryBuilder: any, searchCond: string) {
    queryBuilder
      .leftJoinAndSelect('customer.userStat', 'userStat')
      .select([
        'customer.id',
        'customer.firstname',
        'customer.lastname',
        'customer.statusid',
        'userStat.status as statusname',
      ]);

    if (searchCond) {
      queryBuilder.where(
        '(customer.firstname LIKE :search OR customer.lastname LIKE :search OR userStat.status LIKE :search)',
        { search: `%${searchCond}%` },
      );
    }
  }

  private async getStatName(statusid: number): Promise<string> {
    const repo = this.getRepository(UserStatus);
    const status = await repo.findOne({ where: { id: statusid } as any });
    return status?.status || 'Unknown';
  }

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (item: any) => {
        const statusName = await this.getStatName(item.statusid);
        return {
          id: item.id,
          lastname: item.lastname,
          firstname: item.firstname,
          statusname: statusName,
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

  async findPaginated(
    entity: EntityTarget<Customer>,
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
      const queryBuilder = repo.createQueryBuilder('customer');

      this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<Customer>(queryBuilder, {
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
