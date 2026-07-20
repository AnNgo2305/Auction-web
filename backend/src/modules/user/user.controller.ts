import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { ResponsePayload } from '@common/types/response.interface';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Request } from 'express';

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
}
