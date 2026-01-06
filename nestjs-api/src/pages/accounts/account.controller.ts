import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import {
  denyRoleBasedAccess,
  hasReadAccess,
  hasUpdateAccess,
} from 'src/component/validateaccess/validate-rbactoken';
import {
  ValidateAccessMethod,
  isGranted,
  getValidationError,
} from 'src/component/validateaccess/validate-access.decorator';
import { AccountCardApiResponseDto, UpdateDto } from './dto/account.dto';
import { getLoggedEmployee } from 'src/component/LoggedIn';
import { AccountService } from './account.service';
import { UserEntity } from '../users/entity/user.entity';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('getoption/:labelName')
  async getOptionsByType(
    @Param('labelName') labelName: string,
  ): Promise<{ data: { value: string; label: string }[] }> {
    const optionsMap: Record<
      string,
      () => Promise<{ value: string; label: string }[]>
    > = {
      getmyroles: () => {
        return Promise.resolve([
          { value: '1', label: 'SUPER-ADMIN' },
          { value: '2', label: 'USER' },
        ]);
      },
    };

    const getOptionsFn = optionsMap[labelName];
    const data = await getOptionsFn();
    return { data };
  }

  @Get('getcard')
  @ValidateAccessMethod({ RBACModule: 'accounts' })
  async findOne(@Req() req: Request): Promise<AccountCardApiResponseDto> {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasReadAccess(req)) return denyRoleBasedAccess();

    // Get the logged-in employee's ID
    const idString = await getLoggedEmployee(req);
    const userId = Number(idString);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Delegate business logic to service layer
    const data = await this.accountService.getAccountCard(userId);

    return {
      data,
      meta: [],
      message: '',
    };
  }

  @Put('updatecard')
  @ValidateAccessMethod({ RBACModule: 'accounts' })
  async update(@Body() updateDto: UpdateDto, @Req() req: Request) {
    if (!isGranted(req)) {
      throw new ForbiddenException(getValidationError(req) || 'Access denied');
    }
    if (!hasUpdateAccess(req)) return denyRoleBasedAccess();
    if (!updateDto.id) throw new BadRequestException('No id Found');

    // Get the logged-in employee's ID to ensure users can only update their own account
    const idString = await getLoggedEmployee(req);
    const userId = Number(idString);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    if (updateDto.id !== userId) {
      throw new ForbiddenException('You can only update your own account');
    }

    const result = await this.accountService.update(
      UserEntity,
      updateDto.id,
      updateDto,
    );
    return { data: result };
  }
}
