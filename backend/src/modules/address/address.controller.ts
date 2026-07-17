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

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
