import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  Repository,
  ObjectLiteral,
  EntityTarget,
  DeepPartial,
  In,
} from 'typeorm';
import { UserEntity } from './entity/user.entity';
import * as argon2 from 'argon2';
import { paginate } from 'nestjs-typeorm-paginate';
import { UserStatusEntity } from 'src/pages/userstatuses/entity/userstatuses.entity';
import { RoleEntity } from '../roles/entity/role.entity';

@Injectable()
export class UserService {
  private readonly DEFAULT_PAGE_LIMIT = 1;
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  private getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    try {
      return this.dataSource.getRepository(entity);
    } catch (error) {
      throw new Error(`Repository for entity '${entity}' not found.`);
    }
  }

  async findByEmail(email: string) {
    const user = await this.getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    return user;
  }

  async findAll() {
    return await this.getRepository(UserEntity).find();
  }

  async findOne<T extends ObjectLiteral>(entity: EntityTarget<T>, id: number) {
    if (!id) throw new Error('ID is required');
    const repo = this.getRepository(entity);
    const data = await repo.findOneBy({ id } as any);
    if (!data) throw new NotFoundException(`Record with ID ${id} not found`);
    return data;
  }

  async create(data: DeepPartial<UserEntity>) {
    const repo = this.getRepository(UserEntity);
    const existing = await repo.findOne({ where: { email: data.email } });

    if (existing) throw new BadRequestException('Email is already registered');

    if (data.password?.trim()) {
      data.password = await argon2.hash(data.password);
    }

    const created = repo.create(data);
    const saved = await repo.save(created);

    const { password, ...safeUser } = saved;
    return safeUser;
  }

  async update(id: number, data: DeepPartial<UserEntity>) {
    console.log('Updating user with data:', { id, data });
    const repo = this.getRepository(UserEntity);
    const existing = await repo.findOne({ where: { id } });

    if (!existing) throw new NotFoundException(`User with ID ${id} not found`);

    const merged = repo.merge(existing, data);
    const saved = await repo.save(merged);
    return saved;
  }

  async delete(id: number) {
    const repo = this.getRepository(UserEntity);
    const existing = await repo.findOne({ where: { id } });

    if (!existing) throw new NotFoundException(`User with ID ${id} not found`);

    await repo.delete(id);
    return { message: `User with ID ${id} deleted successfully` };
  }

  private buildSearchQuery(queryBuilder: any, searchCond: string) {
    queryBuilder;

    if (searchCond) {
      queryBuilder.where(
        '(user.email LIKE :search OR user.phonenumber LIKE :search OR DATE_FORMAT(user.birthdate, "%M %d, %Y") LIKE :search)',
        { search: `%${searchCond}%` },
      );
    }
  }

  private async getRoleNames(assignedroles: string[]): Promise<string[]> {
    const options = await this.roleRepository.find({
      where: { id: In(assignedroles.map((id) => parseInt(id))) },
    });
    const optionMap = new Map(
      options.map((option) => [option.id, option.name]),
    );

    return assignedroles.map((id) => optionMap.get(parseInt(id)) || 'Unknown');
  }

  private async getStatusName(statusid: number): Promise<string> {
    const repo = this.getRepository(UserStatusEntity);
    const status = await repo.findOne({ where: { id: statusid } as any });
    const result = status?.status || 'Unknown';
    return result;
  }
  private async getDefaultRoleName(defaultroleid: number): Promise<string> {
    const repo = this.getRepository(RoleEntity);
    const defrolerid = await repo.findOne({
      where: { id: defaultroleid } as any,
    });
    const result = defrolerid?.name || 'Unknown';
    return result;
  }

  private async formatBirthdate(birthdate: string): Promise<string | null> {
    const repo = this.getRepository(UserEntity);
    const user = await repo.findOne({ where: { birthdate } as any });
    if (user && user.birthdate) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date(user.birthdate));
    }
    return null;
  }

  private async resultData(data: UserEntity[]) {
    const result = await Promise.all(
      data.map(async (data: any) => {
        const statusName = await this.getStatusName(data.statusid);
        const birthdateText = await this.formatBirthdate(data.birthdate);
        const dfroleName = await this.getDefaultRoleName(data.defaultroleid);
        const roleNames = await this.getRoleNames(data.assignedroles);
        return {
          id: data.id,
          statusname: statusName,
          email: data.email,
          // phonenumber: data.phonenumber,
          // birthdate: birthdateText,
          defaultroleid: data.defaultroleid,
          defaultrolename: dfroleName,
          roleName: roleNames.join(', '),
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

  async getMainIndexTable(
    entity: EntityTarget<UserEntity>,
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
      const queryBuilder = repo.createQueryBuilder('user');

      this.buildSearchQuery(queryBuilder, searchCond);

      const result = await paginate<UserEntity>(queryBuilder, {
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
