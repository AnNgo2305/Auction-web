import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { ResponsePayload } from '@common/types/response.interface';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { MeResponseDto } from '@modules/user/dtos/me.response.dto';
import { ERROR_USER_NOT_EXIST } from '@modules/user/user.constant';

@ApiTags('Users')
@ApiExtraModels(SuccessResponse, ErrorResponse, MeResponseDto)
@SkipThrottle()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        { properties: { data: { $ref: getSchemaPath(MeResponseDto) } } },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Current user retrieved successfully',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        username: 'nguyenvana',
        role: 'USER',
        profileImageUrl: 'https://example.com/avatar.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_USER_NOT_EXIST.message,
    type: ErrorResponse,
    example: ERROR_USER_NOT_EXIST,
  })
  @ApiCookieAuth('access_token')
  async getMe(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    const result = await this.userService.getMe(userId);

    return {
      message: 'Current user retrieved successfully',
      data: result,
    };
  }
}
