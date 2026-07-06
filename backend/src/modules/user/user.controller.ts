import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  Req,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { ResponsePayload } from '@common/types/response.interface';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@generated/prisma/enums';
import { UserQueryDto } from '@modules/user/dtos/get-users.query.dto';
import { Request } from 'express';
import { CreateWarningDto } from '@modules/user/dtos/create-warning.body.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    const result = await this.userService.getMe(userId);

    return {
      message: 'Current user retrieved successfully',
      data: result,
    };
  }

  @Get()
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() filter: UserQueryDto): Promise<ResponsePayload> {
    const result = await this.userService.findUsers(filter);
    return {
      message: 'Users retrieved successfully',
      data: {
        users: result.data,
        meta: result.meta,
      },
    };
  }

  @Get(':userId/warnings')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUserWarnings(
    @Param('userId') userId: string,
  ): Promise<ResponsePayload> {
    const result = await this.userService.getUserWarnings(userId);
    return {
      message: 'User warnings retrieved successfully',
      data: result,
    };
  }

  @Post(':userId/warnings')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createWarning(
    @Param('userId') userId: string,
    @Body() dto: CreateWarningDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const adminId = req.user?.userId as string;
    const result = await this.userService.createWarning(userId, dto, adminId);
    return {
      message: 'Warning created successfully',
      data: result,
    };
  }

  @Delete('warnings/:warningId')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeWarning(
    @Param('warningId') warningId: string,
  ): Promise<ResponsePayload> {
    const result = await this.userService.removeWarning(warningId);
    return {
      message: 'Warning removed successfully',
      data: result,
    };
  }

  @Patch(':userId/ban')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('userId') userId: string): Promise<ResponsePayload> {
    const result = await this.userService.banUser(userId);
    return {
      message: 'User banned successfully',
      data: result,
    };
  }

  @Patch(':userId/unban')
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('userId') userId: string): Promise<ResponsePayload> {
    const result = await this.userService.unbanUser(userId);
    return {
      message: 'User unbanned successfully',
      data: result,
    };
  }
}
