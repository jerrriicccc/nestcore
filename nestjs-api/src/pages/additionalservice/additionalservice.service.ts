import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AdditionalServiceEntity } from './entity/additionalservice.entity';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class AdditionalService {
  private readonly DEFAULT_PAGE_LIMIT = 15;

  constructor(
    @InjectRepository(AdditionalServiceEntity)
    private readonly additionalServiceRepository: Repository<AdditionalServiceEntity>,
  ) {}

  async create(data: DeepPartial<AdditionalServiceEntity>) {
    const entity = this.additionalServiceRepository.create(data);
    return await this.additionalServiceRepository.save(entity);
  }

  async findAll() {
    return await this.additionalServiceRepository.find();
  }

  async findOne(id: number) {
    if (!id) throw new BadRequestException('ID is required');
    const data = await this.additionalServiceRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException(`Item with ID ${id} not found`);
    return data;
  }

  async update(id: number, data: DeepPartial<AdditionalServiceEntity>) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const existing = await this.additionalServiceRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    const updated = this.additionalServiceRepository.merge(existing, data);
    return await this.additionalServiceRepository.save(updated);
  }

  async delete(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const existing = await this.additionalServiceRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    await this.additionalServiceRepository.delete(id);
    return { message: `Record with ID ${id} deleted successfully` };
  }

  private async resultData(data: any[]) {
    return Promise.resolve(data);
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
      const queryBuilder = this.additionalServiceRepository.createQueryBuilder('additionalservices');

      if (searchCond && searchCond.trim().length > 0) {
        queryBuilder.andWhere('additionalservices.additionalservice LIKE :q', {
          q: `%${searchCond}%`,
        });
      }

      const result = await paginate<AdditionalServiceEntity>(queryBuilder, {
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
