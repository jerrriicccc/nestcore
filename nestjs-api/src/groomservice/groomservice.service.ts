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
import { GroomServiceEntity } from './entity/groomservice.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { CategoryTypeEntity } from '../categorytype/entity/categorytype.entity';

@Injectable()
export class GroomService {
  private readonly DEFAULT_PAGE_LIMIT = 15;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(GroomServiceEntity)
    private readonly groomServiceRepository: Repository<GroomServiceEntity>,
    @InjectRepository(CategoryTypeEntity)
    private readonly categoryTypeRepository: Repository<CategoryTypeEntity>,
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

  // Get price for selected size + type
  async getPrice(size: string, type: string): Promise<number | null> {
    const record = await this.groomServiceRepository.findOne({
      where: { size, type },
    });

    return record ? record.price : null;
  }

  async getTypeOption(
    size: string,
  ): Promise<{ value: number; label: string }[]> {
    const list = await this.groomServiceRepository.find({ where: { size } });

    const unique = list.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.type === item.type),
    );

    return unique.map((data) => ({
      value: data.id,
      label: data.type,
    }));
  }

  // Unique Sizes
  async getSizeOption(): Promise<{ value: number; label: string }[]> {
    const list = await this.groomServiceRepository.find();

    const unique = list.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.size === item.size),
    );

    return unique.map((data) => ({
      value: data.id,
      label: data.size,
    }));

    // return result;
  }

  async getCatTypeName(categorytypeid: number): Promise<string> {
    const catType = await this.categoryTypeRepository.findOne({
      where: { id: categorytypeid },
    });
    return catType ? catType.servicetype : '';
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
        const catName = await this.getCatTypeName(data.categorytypeid);
        return {
          ...data,
          catName,
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
    entity: EntityTarget<GroomServiceEntity>,
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
      const queryBuilder = repo.createQueryBuilder('groomservices');

      // this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<GroomServiceEntity>(queryBuilder, {
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
