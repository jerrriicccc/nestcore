import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ObjectLiteral, EntityTarget } from 'typeorm';
import { RoleAccessType } from './entity/roleaccesstype.entity';

@Injectable()
export class RoleAccessTypesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  async getRoleAccessTypesOptions(): Promise<
    { value: string; label: string }[]
  > {
    const repo = this.getRepository(RoleAccessType);
    const list = await repo.find();

    return list.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }
}
