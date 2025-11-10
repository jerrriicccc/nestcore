import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  ObjectLiteral,
  EntityTarget,
  DeepPartial,
} from 'typeorm';
import { RoleAccessOption } from './entity/roleaccessoption.entity';

@Injectable()
export class RoleAccessOptionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleAccessOption)
    private readonly roleAccessOptionRepository: Repository<RoleAccessOption>,
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

  async getRoleAccessOptions(): Promise<{ value: string; label: string }[]> {
    const repo = this.getRepository(RoleAccessOption);
    const list = await repo.find();

    return list.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }
}
