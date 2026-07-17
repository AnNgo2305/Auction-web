import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { AddressResponseDto } from '@modules/address/dtos/address.response.dto';
import { UpdateAddressesDto } from '@modules/address/dtos/update-addresses.body.dto';
import {
  MAX_ADDRESS_COUNT,
  ERROR_TOO_MANY_ADDRESSES,
} from '@modules/address/address.constant';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getAddressesByUserId(userId: string): Promise<AddressResponseDto[]> {
    this.logger.log(`Getting addresses for user ${userId}`);

    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        addressId: true,
        streetAddress: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        addressType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(
      `Retrieved ${addresses.length} address(es) for user ${userId}`,
    );

    return addresses;
  }

  async updateAddresses(
    userId: string,
    newAddresses: UpdateAddressesDto[],
  ): Promise<void> {
    this.logger.log(
      `Replacing addresses for user ${userId}. New address count: ${newAddresses.length}`,
    );

    if (newAddresses.length > MAX_ADDRESS_COUNT) {
      this.logger.warn(
        `User ${userId} exceeded maximum address count (${newAddresses.length}/${MAX_ADDRESS_COUNT})`,
      );
      throw new BadRequestException(ERROR_TOO_MANY_ADDRESSES);
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.address.deleteMany({
        where: { userId },
      });

      if (newAddresses.length > 0) {
        await prisma.address.createMany({
          data: newAddresses.map((addr) => ({
            userId,
            streetAddress: addr.streetAddress,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            addressType: addr.addressType,
          })),
        });
      }
    });

    this.logger.log(
      `Successfully replaced addresses for user ${userId}. Total addresses: ${newAddresses.length}`,
    );
  }
}
