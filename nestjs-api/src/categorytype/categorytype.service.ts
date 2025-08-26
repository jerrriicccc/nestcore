import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ObjectLiteral, EntityTarget } from 'typeorm';
import { CategoryTypeEntity } from './entity/categorytype.entity';

@Injectable()
export class CategoryTypeService {
  private readonly DEFAULT_PAGE_LIMIT = 5;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(CategoryTypeEntity)
    private readonly serviceTypeRepository: Repository<CategoryTypeEntity>,
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

  async getCategoryOption(): Promise<{ value: number; label: string }[]> {
    const list = await this.serviceTypeRepository.find();
    return list.map((data) => ({
      value: data.id,
      label: data.servicetype,
    }));
  }
}
