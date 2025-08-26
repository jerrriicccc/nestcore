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
import { RoleAccessDetail } from './entity/roleaccessdetail.entity';
import { RoleAccessOption } from '../roleaccessoptions/entity/roleaccessoption.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { RoleAccessType } from 'src/roleaccesstypes/entity/roleaccesstype.entity';

@Injectable()
export class RoleAccessDetailsService {
  private readonly DEFAULT_PAGE_LIMIT = 5;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleAccessDetail)
    private readonly roleAccessDetailsRepository: Repository<RoleAccessDetail>,
    @InjectRepository(RoleAccessOption)
    private readonly roleAccessOptionRepository: Repository<RoleAccessOption>,
    @InjectRepository(RoleAccessType)
    private readonly roleAccessTypeRepository: Repository<RoleAccessType>,
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

    return repo.save(result);
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

  private async getAccessNames(access: string[]): Promise<string[]> {
    const options = await this.roleAccessOptionRepository.find({
      where: { id: In(access.map((id) => parseInt(id))) },
    });

    // Create a map for quick lookup
    const optionMap = new Map(
      options.map((option) => [option.id, option.name]),
    );

    // Map the access array in the original order
    return access.map((id) => optionMap.get(parseInt(id)) || 'Unknown');
  }

  private async getTypeNames(typeid: number): Promise<string> {
    const repo = this.getRepository(RoleAccessType);
    const type = await repo.findOne({ where: { id: typeid } as any });
    return type?.name || 'Unknown';
  }

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (item: any) => {
        const accessNames = await this.getAccessNames(item.access);
        const typeName = await this.getTypeNames(item.typeid);
        return {
          id: item.id,
          name: item.name,
          access: item.access,
          typeName: typeName,
          accessName: accessNames,
        };
      }),
    );
    return result;
  }

  private buildSearchQuery(queryBuilder: any, searchCond: string) {
    if (!searchCond) return;

    queryBuilder.where('roleaccessdetails.name LIKE :search', {
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
    entity: EntityTarget<RoleAccessDetail>,
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
      const queryBuilder = repo.createQueryBuilder('roleaccessdetails');
      this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<RoleAccessDetail>(queryBuilder, {
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
