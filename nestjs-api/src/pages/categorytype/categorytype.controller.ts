import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CategoryTypeService } from './categorytype.service';

interface PaginationQuery {
  page?: number;
  searchcond?: string;
}

@UseGuards(AuthGuard)
@Controller('categorytypes')
export class CategoryTypeController {
  constructor(private readonly categoryTypeService: CategoryTypeService) {}
}
