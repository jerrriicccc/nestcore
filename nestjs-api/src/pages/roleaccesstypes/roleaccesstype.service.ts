import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ObjectLiteral, EntityTarget } from 'typeorm';
import { RoleAccessTypeEntity } from './entity/roleaccesstype.entity';

@Injectable()
export class RoleAccessTypesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleAccessTypeEntity)
    private readonly roleAccessTypeRepository: Repository<RoleAccessTypeEntity>,
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

  // async getRoleAccessTypesOptions(): Promise<
  //   { value: string; label: string }[]
  // > {
  //   const repo = this.getRepository(RoleAccessTypeEntity);
  //   const list = await repo.find();

  //   const result = list.map((item) => ({
  //     value: String(item.id),
  //     label: item.name,
  //   }));

  //   return result;
  // }

  async getRoleAccessTypesOptions(): Promise<
    { value: string; label: string }[]
  > {
    const repo = this.getRepository(RoleAccessTypeEntity);

    const list = await repo
      .createQueryBuilder('roleAccessTypeEntity')
      .select('roleAccessTypeEntity.id', 'value')
      .addSelect('roleAccessTypeEntity.name', 'label')
      .getRawMany();

    const result = list.map((item) => ({
      value: String(item.value),
      label: item.label,
    }));

    return result;
  }
}
