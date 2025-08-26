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
import { Role } from './entity/role.entity';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { RoleAccessDetail } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleLine } from '../rolelines/entity/roleline.entity';
import { Customer } from '../customers/entity/customers.entity';

@Injectable()
export class RolesService {
  private readonly DEFAULT_PAGE_LIMIT = 5;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleAccessDetail)
    private readonly roleAccessDetailRepository: Repository<RoleAccessDetail>,
    @InjectRepository(RoleLine)
    private readonly roleLineRepository: Repository<RoleLine>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
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

  async getCustomerOptions(): Promise<{ value: string; label: string }[]> {
    const list = await this.customerRepository.find();
    return list.map((data) => ({
      value: String(data.id),
      label: data.lastname + ' ' + data.firstname,
    }));
  }

  async getGlobalAccessData(roleid: number): Promise<any[]> {
    const result = await this.roleAccessDetailRepository.find();
    const data = result.map((data) => ({
      id: data.id,
      accesskey: data.accesskey,
      TYPE: data.typeid,
    }));

    const saveData = await this.roleLineRepository.save(
      data.map((item) => ({
        roleid: roleid,
        accesskey: item.accesskey,
        parentkey: '',
        typeid: item.TYPE,
      })),
    );

    return saveData;
  }

  async getRoleNameOptions(): Promise<{ value: string; label: string }[]> {
    const data = await this.roleRepository.find();
    return data.map((data) => ({
      value: data.id.toString(),
      label: data.name,
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
    if (!data) throw new NotFoundException(`Record with ID ${id} not found`);
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
    if (!searchCond) return;

    queryBuilder.where('(role.name LIKE :search)', {
      search: `%${searchCond}%`,
    });
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
    entity: EntityTarget<Role>,
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
      const queryBuilder = repo.createQueryBuilder('role');

      this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<Role>(queryBuilder, {
        page: Math.max(1, page),
        limit,
      });

      return {
        data: result.items,
        meta: this.paginationMeta(result.meta),
      };
    } catch (error) {
      console.error('Error in findPaginated:', error);
      throw new InternalServerErrorException('Failed to fetch paginated data');
    }
  }
}
