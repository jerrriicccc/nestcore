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
  FindOptionsWhere,
  In,
} from 'typeorm';
import { RoleLine } from './entity/roleline.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { SearchCondDto } from './dto/search-cond.dto';
import { RoleAccessDetail } from 'src/roleaccessdetails/entity/roleaccessdetail.entity';

@Injectable()
export class RoleLinesService {
  private readonly DEFAULT_PAGE_LIMIT = 5;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleLine)
    private readonly roleLineRepository: Repository<RoleLine>,
    @InjectRepository(RoleAccessDetail)
    private readonly roleAccessDetailRepository: Repository<RoleAccessDetail>,
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
    return await repo.save(result);
  }

  // async findAll<T extends ObjectLiteral>(
  //   entity: EntityTarget<T>,
  //   dto: SearchCondDto,
  // ): Promise<T[]> {
  //   const repo = this.getRepository(entity);
  //   const where = {} as FindOptionsWhere<T>;

  //   // Handle roleid
  //   if (dto.roleid) {
  //     Object.assign(where, { roleid: dto.roleid });
  //   }

  //   // Handle typeid (both single value and array)
  //   if (dto.typeid) {
  //     if (Array.isArray(dto.typeid)) {
  //       Object.assign(where, { typeid: In(dto.typeid) });
  //     } else {
  //       Object.assign(where, { typeid: dto.typeid });
  //     }
  //   }

  //   return await repo.find({ where });
  // }

  // async findAll<T extends ObjectLiteral>(
  //   entity: EntityTarget<T>,
  //   dto: SearchCondDto,
  // ): Promise<any[]> {
  //   const repo = this.getRepository(entity);
  //   const where = {} as FindOptionsWhere<T>;

  //   // Handle roleid
  //   if (dto.roleid) {
  //     Object.assign(where, { roleid: dto.roleid });
  //   }

  //   // Handle typeid (both single value and array)
  //   if (dto.typeid) {
  //     if (Array.isArray(dto.typeid)) {
  //       Object.assign(where, { typeid: In(dto.typeid) });
  //     } else {
  //       Object.assign(where, { typeid: dto.typeid });
  //     }
  //   }

  //   const data = await repo.find({ where });

  //   // Fetch accessName for each item
  //   const result = await Promise.all(
  //     data.map(async (item: any) => {
  //       const accessDetailRepo = this.getRepository(RoleAccessDetail);
  //       const accessName = await accessDetailRepo.findOne({
  //         where: { name: item.name } as any,
  //       });

  //       return {
  //         ...item,
  //         accessName, // Or accessName?.name, depending on what you want to return
  //       };
  //     }),
  //   );

  //   return result;
  // }

  async findAll<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    dto: SearchCondDto,
  ): Promise<any[]> {
    const repo = this.getRepository(entity);
    const where = {} as FindOptionsWhere<T>;

    // Handle roleid
    if (dto.roleid) {
      Object.assign(where, { roleid: dto.roleid });
    }

    // Handle typeid (single or array)
    if (dto.typeid) {
      if (Array.isArray(dto.typeid)) {
        Object.assign(where, { typeid: In(dto.typeid) });
      } else {
        Object.assign(where, { typeid: dto.typeid });
      }
    }

    const data = await repo.find({ where });

    // Lookup RoleAccessDetail by name and typeid
    const result = await Promise.all(
      data.map(async (data: any) => {
        const accessDetailRepo = this.getRepository(RoleAccessDetail);
        const accessDetail = await accessDetailRepo.findOne({
          where: {
            name: data.name,
            typeid: data.typeid,
          } as any,
        });

        return {
          ...data,
          accessName: accessDetail?.name || null,
        };
      }),
    );

    return result;
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
}
