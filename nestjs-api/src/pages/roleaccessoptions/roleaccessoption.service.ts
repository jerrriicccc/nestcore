import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  ObjectLiteral,
  EntityTarget,
  DeepPartial,
} from 'typeorm';
import { RoleAccessOptionEntity } from './entity/roleaccessoption.entity';

@Injectable()
export class RoleAccessOptionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleAccessOptionEntity)
    private readonly roleAccessOptionRepository: Repository<RoleAccessOptionEntity>,
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

  // async getRoleAccessOptions(): Promise<{ value: string; label: string }[]> {
  //   const repo = this.getRepository(RoleAccessOptionEntity);
  //   const list = await repo.find();

  //   const result = list.map((item) => ({
  //     value: String(item.id),
  //     label: item.name,
  //   }));

  //   return result;
  // }

  async getRoleAccessOptions(): Promise<{ value: string; label: string }[]> {
    const repo = this.getRepository(RoleAccessOptionEntity);

    const list = await repo
      .createQueryBuilder('roleAccessOptionEntity')
      .select('roleAccessOptionEntity.id', 'value')
      .addSelect('roleAccessOptionEntity.name', 'label')
      .getRawMany();

    const result = list.map((item) => ({
      value: String(item.value),
      label: item.label,
    }));
    return result;
  }
}
