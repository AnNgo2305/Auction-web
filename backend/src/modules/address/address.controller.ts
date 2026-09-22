import {
  Controller,
  Get,
  Put,
  Req,
  Body,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AddressService } from '@modules/address/address.service';
import { AddressResponseDto } from '@modules/address/dtos/address.response.dto';
import { UpdateAddressesDto } from '@modules/address/dtos/update-addresses.body.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';

@ApiTags('Addresses')
@ApiExtraModels(SuccessResponse, ErrorResponse, AddressResponseDto)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(':userId')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user addresses',
    description: 'Retrieves the addresses associated with a user.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID',
  })
  @ApiOkResponse({
    description: 'Addresses retrieved successfully',
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(SuccessResponse),
        },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(AddressResponseDto),
              },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Addresses retrieved successfully',
      data: [
        {
          addressId: '550e8400-e29b-41d4-a716-446655440000',
          streetAddress: '123 Nguyen Trai Street',
          city: 'Hanoi',
          state: 'Cau Giay',
          postalCode: '100000',
          country: 'Vietnam',
          addressType: 'HOME',
          createdAt: '2026-09-22T05:30:00.000Z',
          updatedAt: '2026-09-22T05:30:00.000Z',
        },
      ],
    },
  })
  async getUserAddresses(
    @Param('userId') userId: string,
  ): Promise<ResponsePayload> {
    const addresses: AddressResponseDto[] =
      await this.addressService.getAddressesByUserId(userId);
    return {
      message: 'Addresses retrieved successfully',
      data: addresses,
    };
  }

  @Put()
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user addresses',
    description:
      'Replaces the current authenticated user addresses with the provided list.',
  })
  @ApiBody({
    type: UpdateAddressesDto,
    isArray: true,
    description: 'List of addresses to replace the user addresses with',
  })
  @ApiOkResponse({
    description: 'Addresses updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Addresses updated successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: 'Too many addresses',
    type: ErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponse,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateUserAddresses(
    @Req() req: Request,
    @Body() addresses: UpdateAddressesDto[],
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    await this.addressService.updateAddresses(userId as string, addresses);
    return {
      message: 'Addresses updated successfully',
      data: {},
    };
  }
}
