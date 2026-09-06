import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuctionStatus } from '@generated/prisma/enums';

import { LoggerService } from '@common/services/logger.service';
import {
  ERROR_AUCTION_ACCESS_DENIED,
  ERROR_AUCTION_CANNOT_CANCEL,
  ERROR_AUCTION_CANNOT_UPDATE,
  ERROR_AUCTION_INVALID_STATUS,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_OPEN,
} from '@modules/auction/auction.constant';

@Injectable()
export class AuctionPermissionService {
  constructor(private readonly logger: LoggerService) {}

  canViewAuction(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    currentUserId?: string,
  ): void {
    const isOwner =
      currentUserId !== undefined && auction.sellerId === currentUserId;

    if (
      !isOwner &&
      auction.status !== AuctionStatus.READY &&
      auction.status !== AuctionStatus.OPEN &&
      auction.status !== AuctionStatus.EXTENDED &&
      auction.status !== AuctionStatus.CLOSED &&
      auction.status !== AuctionStatus.COMPLETED
    ) {
      this.logger.warn(
        `User ${currentUserId ?? 'anonymous'} attempted to access unavailable auction ${auction.auctionId} (status: ${auction.status})`,
      );

      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }
  }

  canEditAuction(
    auction: {
      auctionId: string;
      sellerId: string;
    },
    currentUserId: string,
  ): void {
    if (auction.sellerId === currentUserId) {
      return;
    }

    this.logger.warn(
      `User ${currentUserId} attempted to edit auction ${auction.auctionId} owned by another seller`,
    );

    throw new ForbiddenException(ERROR_AUCTION_ACCESS_DENIED);
  }

  canUpdateAuction(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    currentUserId: string,
  ): void {
    this.canEditAuction(auction, currentUserId);

    if (
      auction.status !== AuctionStatus.PENDING &&
      auction.status !== AuctionStatus.READY
    ) {
      this.logger.warn(
        `User ${currentUserId} attempted to update auction ${auction.auctionId} with status ${auction.status}`,
      );

      throw new BadRequestException(ERROR_AUCTION_CANNOT_UPDATE);
    }
  }

  canCancelAuction(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    currentUserId: string,
  ): void {
    this.canEditAuction(auction, currentUserId);

    if (
      auction.status !== AuctionStatus.PENDING &&
      auction.status !== AuctionStatus.READY
    ) {
      this.logger.warn(
        `User ${currentUserId} attempted to cancel auction ${auction.auctionId} with status ${auction.status}`,
      );

      throw new BadRequestException(ERROR_AUCTION_CANNOT_CANCEL);
    }
  }

  canResubmitAuction(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    currentUserId: string,
  ): void {
    this.canEditAuction(auction, currentUserId);

    if (auction.status !== AuctionStatus.CANCELED) {
      this.logger.warn(
        `User ${currentUserId} attempted to resubmit auction ${auction.auctionId} with status ${auction.status}`,
      );

      throw new BadRequestException(ERROR_AUCTION_INVALID_STATUS);
    }
  }

  canEndAuction(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    currentUserId: string,
  ): void {
    this.canEditAuction(auction, currentUserId);

    if (
      auction.status !== AuctionStatus.OPEN &&
      auction.status !== AuctionStatus.EXTENDED
    ) {
      this.logger.warn(
        `User ${currentUserId} attempted to end auction ${auction.auctionId} with status ${auction.status}`,
      );

      throw new BadRequestException(ERROR_AUCTION_NOT_OPEN);
    }
  }
}
