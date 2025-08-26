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
import { PetEntryLineEntity } from './entity/petentryline.entity';

@Injectable()
export class PetEntryLineService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(PetEntryLineEntity)
    private readonly petEntryLineRepository: Repository<PetEntryLineEntity>,
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

  // async create<T extends ObjectLiteral>(
  //   entity: EntityTarget<T>,
  //   data: DeepPartial<T>,
  // ) {
  //   const repo = this.getRepository(entity);
  //   const result = repo.create(data);
  //   return await repo.save(result);
  // }
}
