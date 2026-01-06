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
import { RoleAccessDetailEntity } from './entity/roleaccessdetail.entity';
// import { RoleAccessOptionEntity } from '../roleaccessoptions/entity/roleaccessoption.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { RoleAccessTypeEntity } from 'src/pages/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleLineEntity } from '../rolelines/entity/roleline.entity';

@Injectable()
export class RoleAccessDetailsService {
  private readonly DEFAULT_PAGE_LIMIT = 10;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleAccessDetailEntity)
    private readonly roleAccessDetailsRepository: Repository<RoleAccessDetailEntity>,
    // @InjectRepository(RoleAccessOptionEntity)
    // private readonly roleAccessOptionRepository: Repository<RoleAccessOptionEntity>,
    @InjectRepository(RoleAccessTypeEntity)
    private readonly roleAccessTypeRepository: Repository<RoleAccessTypeEntity>,
    @InjectRepository(RoleLineEntity)
    private readonly roleLineEntityRepository: Repository<RoleLineEntity>,
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

  async getModelsOptions(): Promise<{ value: string; label: string }[]> {
    const repo = this.getRepository(RoleLineEntity);
    const types = await repo
      .createQueryBuilder('RoleLineEntity') // Alias for RoleLineEntity
      .select('MIN(RoleLineEntity.id)', 'id')
      .addSelect('RoleLineEntity.accesskey', 'accesskey')
      .where('RoleLineEntity.typeid = :typeid', { typeid: 1 })
      .groupBy('RoleLineEntity.accesskey')
      .getRawMany();

    const result = types.map((item) => ({
      value: item.accesskey,
      label: item.accesskey,
    }));

    return result;
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

  // ---------------------- Private Function

  private async getTypeNames(typeid: number): Promise<string> {
    const repo = this.getRepository(RoleAccessTypeEntity);
    const type = await repo.findOne({ where: { id: typeid } as any });
    return type?.name || 'Unknown';
  }

  private async resultData(data: any[]) {
    const result = await Promise.all(
      data.map(async (item: any) => {
        const typeName = await this.getTypeNames(item.typeid);
        return {
          id: item.id,
          name: item.name,
          access: item.access,
          typeName: typeName,
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

  async getMainIndexTable(
    entity: EntityTarget<RoleAccessDetailEntity>,
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

      queryBuilder
        .orderBy('roleaccessdetails.typeid', 'ASC')
        .addOrderBy('roleaccessdetails.name', 'ASC');

      const result = await paginate<RoleAccessDetailEntity>(queryBuilder, {
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
}
