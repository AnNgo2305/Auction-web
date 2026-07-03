import {
  ConflictException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import {
  ERROR_ALREADY_BLOCKED,
  ERROR_ALREADY_FOLLOWED,
  ERROR_CANNOT_ACCEPT_SELF,
  ERROR_CANNOT_BLOCK_SELF,
  ERROR_CANNOT_DECLINE_SELF,
  ERROR_CANNOT_FOLLOW_SELF,
  ERROR_CANNOT_UNFOLLOW_SELF,
  ERROR_FOLLOW_BLOCKED,
  ERROR_BIDDER_NOT_FOUND,
  ERROR_NO_FOLLOW_REQUEST,
  ERROR_NOT_FOLLOWING,
  ERROR_SELLER_NOT_FOUND,
  ERROR_UNFOLLOW_BLOCKED,
  ERROR_ALREADY_REQUESTED,
  ERROR_CANNOT_CANCEL_SELF,
  ERROR_TARGET_USER_NOT_FOUND,
  ERROR_CURRENT_USER_NOT_FOUND,
  RelationshipStatus,
  ERROR_CANNOT_UNBLOCK_SELF,
  ERROR_NOT_BLOCKED,
} from '@modules/follow/follow.constant';
import { FollowStatus, Role } from '@generated/prisma/enums';
import { LoggerService } from '@common/services/logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { FollowersResponseDto } from '@modules/follow/dtos/get-followers.response.dto';
import { FollowingsResponseDto } from '@modules/follow/dtos/get-followings.response.dto';
import { BlockedUsersResponseDto } from '@modules/follow/dtos/get-blocked-users.response.dto';
import { ReceivedFollowRequestsCursorResponseDto } from '@modules/follow/dtos/get-received-follow-requests.response.dto';
import { SentFollowRequestsResponseDto } from '@modules/follow/dtos/get-sent-follow-requests.response.dto';
import type { RelationshipStatusResult } from '@modules/follow/dtos/user-follow.response.dto';
import { FollowWhereInput } from '@generated/prisma/models/Follow';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async follow(bidderId: string, sellerId: string): Promise<void> {
    this.logger.log(
      `[FOLLOW] request: bidder=${bidderId} -> seller=${sellerId}`,
    );

    if (bidderId === sellerId) {
      this.logger.warn(`[FOLLOW] self-follow attempt failed: ${bidderId}`);
      throw new ConflictException(ERROR_CANNOT_FOLLOW_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId: sellerId,
        },
      },
      select: {
        status: true,
        followId: true,
      },
    });

    if (existingFollow) {
      this.logger.log(
        `[FOLLOW] existing relation found: status=${existingFollow.status}`,
      );
      switch (existingFollow.status) {
        case FollowStatus.BLOCKED:
          this.logger.warn(
            `[FOLLOW] blocked relationship: ${bidderId} -> ${sellerId}`,
          );
          throw new ForbiddenException(ERROR_FOLLOW_BLOCKED);

        case FollowStatus.PENDING:
          this.logger.warn(
            `[FOLLOW] duplicate request (PENDING): ${bidderId} -> ${sellerId}`,
          );
          throw new ConflictException(ERROR_ALREADY_REQUESTED);

        case FollowStatus.ACTIVE:
          this.logger.warn(
            `[FOLLOW] already following (ACTIVE): ${bidderId} -> ${sellerId}`,
          );
          throw new ConflictException(ERROR_ALREADY_FOLLOWED);

        case FollowStatus.DECLINED:
        case FollowStatus.INACTIVE:
          this.logger.log(
            `[FOLLOW] reactivating follow request (status=${existingFollow.status}): ${bidderId} -> ${sellerId}`,
          );
          await this.prisma.follow.update({
            where: {
              followId: existingFollow.followId,
              status: {
                in: [FollowStatus.INACTIVE, FollowStatus.DECLINED],
              },
            },
            data: { status: FollowStatus.PENDING },
          });
          this.logger.log(
            `[FOLLOW] request re-sent successfully: ${bidderId} -> ${sellerId}`,
          );
          return;
      }
    }

    this.logger.log(
      `[FOLLOW] creating new follow request: ${bidderId} -> ${sellerId}`,
    );

    try {
      await this.prisma.follow.create({
        data: {
          followerId: bidderId,
          sellerId,
          status: FollowStatus.PENDING,
        },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(
            `[FOLLOW] race condition detected: ${bidderId} -> ${sellerId}`,
          );
          throw new ConflictException(ERROR_ALREADY_REQUESTED);
        }
      }

      throw error;
    }

    this.logger.log(
      `Follow request created successfully: ${bidderId} -> ${sellerId}`,
    );
  }

  async unfollow(bidderId: string, sellerId: string): Promise<void> {
    this.logger.log(`[UNFOLLOW] request: ${bidderId} -> ${sellerId}`);

    if (bidderId === sellerId) {
      this.logger.warn(`[UNFOLLOW] self-unfollow attempt: ${bidderId}`);
      throw new ConflictException(ERROR_CANNOT_UNFOLLOW_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId: sellerId,
        },
      },
      select: {
        status: true,
        followId: true,
      },
    });

    if (!existingFollow) {
      this.logger.warn(
        `[UNFOLLOW] not found relationship: ${bidderId} -> ${sellerId}`,
      );
      throw new ConflictException(ERROR_NOT_FOLLOWING);
    }

    switch (existingFollow.status) {
      case FollowStatus.BLOCKED:
        this.logger.warn(
          `[UNFOLLOW] blocked relationship: ${bidderId} -> ${sellerId}`,
        );
        throw new ForbiddenException(ERROR_UNFOLLOW_BLOCKED);

      case FollowStatus.ACTIVE:
        await this.prisma.follow.update({
          where: {
            followId: existingFollow.followId,
            status: FollowStatus.ACTIVE,
          },
          data: { status: FollowStatus.INACTIVE },
        });

        this.logger.log(
          `[UNFOLLOW] success ACTIVE -> INACTIVE: ${bidderId} -> ${sellerId}`,
        );
        return;

      case FollowStatus.PENDING:
      case FollowStatus.DECLINED:
      case FollowStatus.INACTIVE:
        this.logger.warn(
          `[UNFOLLOW] invalid state (${existingFollow.status}): ${bidderId} -> ${sellerId}`,
        );
        throw new ConflictException(ERROR_NOT_FOLLOWING);
    }
  }

  async accept(sellerId: string, bidderId: string): Promise<void> {
    this.logger.log(`[ACCEPT] request seller=${sellerId} bidder=${bidderId}`);
    if (sellerId === bidderId) {
      this.logger.warn(`[ACCEPT] invalid self-action seller=${sellerId}`);
      throw new ConflictException(ERROR_CANNOT_ACCEPT_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);

    const existingFollowRequest = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId: sellerId,
        },
      },
      select: {
        status: true,
        followId: true,
      },
    });

    if (
      !existingFollowRequest ||
      existingFollowRequest.status !== FollowStatus.PENDING
    ) {
      this.logger.warn(
        `[ACCEPT] not found request seller=${sellerId} bidder=${bidderId}`,
      );
      throw new NotFoundException(ERROR_NO_FOLLOW_REQUEST);
    }

    await this.prisma.follow.update({
      where: {
        followId: existingFollowRequest.followId,
        status: FollowStatus.PENDING,
      },
      data: {
        status: FollowStatus.ACTIVE,
      },
    });

    this.logger.log(`[ACCEPT] seller=${sellerId} accepted user=${bidderId}`);
  }

  async decline(sellerId: string, bidderId: string): Promise<void> {
    this.logger.log(
      `[FOLLOW][DECLINE] request seller=${sellerId} bidder=${bidderId}`,
    );

    if (sellerId === bidderId) {
      throw new ConflictException(ERROR_CANNOT_DECLINE_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);

    const existingFollowRequest = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId: sellerId,
        },
      },
      select: {
        status: true,
        followId: true,
      },
    });

    if (
      !existingFollowRequest ||
      existingFollowRequest.status !== FollowStatus.PENDING
    ) {
      this.logger.warn(
        `[DECLINE] not found request seller=${sellerId} bidder=${bidderId}`,
      );
      throw new NotFoundException(ERROR_NO_FOLLOW_REQUEST);
    }

    await this.prisma.follow.update({
      where: {
        followId: existingFollowRequest.followId,
        status: FollowStatus.PENDING,
      },
      data: {
        status: FollowStatus.DECLINED,
      },
    });

    this.logger.log(`[DECLINE] success seller=${sellerId} bidder=${bidderId}`);
  }

  async cancel(bidderId: string, sellerId: string): Promise<void> {
    this.logger.log(
      `[CANCEL] request bidder=${bidderId} -> seller=${sellerId}`,
    );

    if (bidderId === sellerId) {
      this.logger.warn(`[CANCEL] invalid self-cancel bidder=${bidderId}`);
      throw new ConflictException(ERROR_CANNOT_CANCEL_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId,
        },
      },
      select: {
        status: true,
        followId: true,
      },
    });

    if (!existingFollow || existingFollow.status !== FollowStatus.PENDING) {
      this.logger.warn(
        `[CANCEL] not found pending request bidder=${bidderId} seller=${sellerId}`,
      );
      throw new NotFoundException(ERROR_NO_FOLLOW_REQUEST);
    }

    await this.prisma.follow.update({
      where: {
        followId: existingFollow.followId,
        status: FollowStatus.PENDING,
      },
      data: {
        status: FollowStatus.INACTIVE,
      },
    });

    this.logger.log(
      `[CANCEL] success PENDING -> INACTIVE bidder=${bidderId} seller=${sellerId}`,
    );
  }

  async block(sellerId: string, bidderId: string): Promise<void> {
    this.logger.log(`[BLOCK] request user=${bidderId} -> seller=${sellerId}`);

    if (sellerId === bidderId) {
      throw new ConflictException(ERROR_CANNOT_BLOCK_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId: sellerId,
        },
      },
      select: {
        followId: true,
        status: true,
      },
    });

    if (!existingFollow) {
      this.logger.log(`[BLOCK] no existing relation → create BLOCKED`);

      await this.prisma.follow.create({
        data: {
          followerId: bidderId,
          sellerId,
          status: FollowStatus.BLOCKED,
        },
      });

      this.logger.log(`[BLOCK] success | user=${bidderId} seller=${sellerId}`);

      return;
    }

    if (existingFollow.status === FollowStatus.BLOCKED) {
      this.logger.warn(
        `[BLOCK] already blocked user=${bidderId} -> ${sellerId}`,
      );
      throw new ConflictException(ERROR_ALREADY_BLOCKED);
    }

    await this.prisma.follow.update({
      where: {
        followId: existingFollow.followId,
      },
      data: {
        status: FollowStatus.BLOCKED,
      },
    });

    this.logger.log(
      `[BLOCK] success ${existingFollow.status} -> BLOCKED | user=${bidderId} seller=${sellerId}`,
    );
  }

  async unblock(sellerId: string, bidderId: string): Promise<void> {
    this.logger.log(`[UNBLOCK] request user=${bidderId} -> seller=${sellerId}`);

    if (sellerId === bidderId) {
      throw new ConflictException(ERROR_CANNOT_UNBLOCK_SELF);
    }

    await this.validateBidderAndSeller(bidderId, sellerId);

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_sellerId: {
          followerId: bidderId,
          sellerId,
        },
      },
      select: {
        followId: true,
        status: true,
      },
    });

    if (!existingFollow || existingFollow.status !== FollowStatus.BLOCKED) {
      this.logger.warn(
        `[UNBLOCK] relationship is not blocked user=${bidderId} -> ${sellerId}`,
      );
      throw new NotFoundException(ERROR_NOT_BLOCKED);
    }

    await this.prisma.follow.update({
      where: {
        followId: existingFollow.followId,
      },
      data: {
        status: FollowStatus.INACTIVE,
      },
    });

    this.logger.log(
      `[UNBLOCK] success BLOCKED -> INACTIVE | user=${bidderId} seller=${sellerId}`,
    );
  }

  async countFollowings(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: {
        followerId: userId,
        status: FollowStatus.ACTIVE,
      },
    });
  }

  async countFollowers(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: {
        sellerId: userId,
        status: FollowStatus.ACTIVE,
      },
    });
  }

  async getFollowers(
    sellerId: string,
    viewerId?: string,
    cursor?: string,
    limit = 10,
  ): Promise<FollowersResponseDto> {
    this.logger.log(
      `[GET_FOLLOWERS] seller=${sellerId} cursor=${cursor ?? 'null'} limit=${limit}`,
    );

    const bidders = await this.prisma.follow.findMany({
      where: {
        sellerId,
        status: FollowStatus.ACTIVE,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          followId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        followId: true,
        follower: {
          select: {
            userId: true,
            username: true,
            role: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = bidders.length > limit;
    const sliced = hasMore ? bidders.slice(0, limit) : bidders;
    const bidderIds = sliced.map(({ follower }) => follower.userId);
    const relationMap = viewerId
      ? await this.resolveRelationships(viewerId, bidderIds)
      : new Map<string, RelationshipStatusResult>();

    this.logger.log(
      `[GET_FOLLOWERS] found=${sliced.length} hasMore=${hasMore} seller=${sellerId}`,
    );

    return {
      bidders: sliced.map(({ follower: bidder }) => ({
        userId: bidder.userId,
        username: bidder.username,
        role: bidder.role,
        profileImageUrl: bidder.profile?.profileImageUrl ?? null,
        relation: relationMap.get(bidder.userId) ?? {
          status: RelationshipStatus.NONE,
        },
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].followId : null,
    };
  }

  async getFollowings(
    bidderId: string,
    viewerId?: string,
    cursor?: string,
    limit = 10,
  ): Promise<FollowingsResponseDto> {
    this.logger.log(
      `[GET_FOLLOWINGS] bidder=${bidderId} cursor=${cursor ?? 'null'} limit=${limit}`,
    );

    const sellers = await this.prisma.follow.findMany({
      where: {
        followerId: bidderId,
        status: FollowStatus.ACTIVE,
        // ...this.buildVisibilityFilter(viewerId),
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          followId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        followId: true,
        seller: {
          select: {
            userId: true,
            username: true,
            role: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = sellers.length > limit;
    const sliced = hasMore ? sellers.slice(0, limit) : sellers;

    const sellerIds = sliced.map(({ seller }) => seller.userId);

    const relationMap = viewerId
      ? await this.resolveRelationships(viewerId, sellerIds)
      : new Map<string, RelationshipStatusResult>();

    this.logger.log(
      `[GET_FOLLOWINGS] found=${sliced.length} hasMore=${hasMore} bidder=${bidderId}`,
    );

    return {
      sellers: sliced.map(({ seller }) => ({
        userId: seller.userId,
        username: seller.username,
        role: seller.role,
        profileImageUrl: seller.profile?.profileImageUrl ?? null,
        relation: relationMap.get(seller.userId) ?? {
          status: RelationshipStatus.NONE,
        },
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].followId : null,
    };
  }

  async getBlockedUsers(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<BlockedUsersResponseDto> {
    const blockedUsers = await this.prisma.follow.findMany({
      where: {
        sellerId: userId,
        status: FollowStatus.BLOCKED,
      },
      select: {
        followId: true,
        follower: {
          select: {
            userId: true,
            username: true,
            role: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          followId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = blockedUsers.length > limit;
    const sliced = hasMore ? blockedUsers.slice(0, limit) : blockedUsers;

    return {
      blockedUsers: sliced.map((blockedUser) => ({
        userId: blockedUser.follower.userId,
        username: blockedUser.follower.username,
        role: blockedUser.follower.role,
        profileImageUrl: blockedUser.follower.profile?.profileImageUrl ?? null,
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].followId : null,
    };
  }

  async getPendingReceivedFollowRequests(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<ReceivedFollowRequestsCursorResponseDto> {
    const receivedFollowRequests = await this.prisma.follow.findMany({
      where: {
        sellerId: userId,
        status: FollowStatus.PENDING,
      },
      select: {
        followId: true,
        follower: {
          select: {
            userId: true,
            username: true,
            role: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          followId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = receivedFollowRequests.length > limit;
    const sliced = hasMore
      ? receivedFollowRequests.slice(0, limit)
      : receivedFollowRequests;

    return {
      receivedFollowRequests: sliced.map((receivedFollowRequest) => ({
        userId: receivedFollowRequest.follower.userId,
        username: receivedFollowRequest.follower.username,
        role: receivedFollowRequest.follower.role,
        profileImageUrl:
          receivedFollowRequest.follower.profile?.profileImageUrl ?? null,
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].followId : null,
    };
  }

  async getSentFollowRequests(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<SentFollowRequestsResponseDto> {
    const sentFollowRequests = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        status: FollowStatus.PENDING,
      },
      select: {
        followId: true,
        seller: {
          select: {
            userId: true,
            username: true,
            role: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          followId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = sentFollowRequests.length > limit;
    const sliced = hasMore
      ? sentFollowRequests.slice(0, limit)
      : sentFollowRequests;

    return {
      sentFollowRequests: sliced.map((sendFollowRequest) => ({
        userId: sendFollowRequest.seller.userId,
        username: sendFollowRequest.seller.username,
        role: sendFollowRequest.seller.role,
        profileImageUrl:
          sendFollowRequest.seller.profile?.profileImageUrl ?? null,
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].followId : null,
    };
  }

  async getFollowStatus(
    targetUserId: string,
    currentUserId?: string,
  ): Promise<RelationshipStatusResult> {
    // Guest user
    if (!currentUserId) {
      return { status: RelationshipStatus.NONE };
    }

    // User seeing his/her own profile
    if (currentUserId === targetUserId) {
      return { status: RelationshipStatus.SELF };
    }

    // Validate users
    const [targetUser, currentUser] = await Promise.all([
      this.prisma.user.findUnique({
        where: { userId: targetUserId },
        select: { userId: true },
      }),
      this.prisma.user.findUnique({
        where: { userId: currentUserId },
        select: { userId: true },
      }),
    ]);
    if (!targetUser) {
      throw new NotFoundException(ERROR_TARGET_USER_NOT_FOUND);
    }
    if (!currentUser) {
      throw new NotFoundException(ERROR_CURRENT_USER_NOT_FOUND);
    }

    return this.resolveRelationship(currentUserId, targetUserId);
  }

  async countMutualFollowedSellers(
    bidderAId: string,
    bidderBId: string,
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM (
      SELECT seller_id
      FROM follows
      WHERE follower_id = ${bidderAId}
        AND status = 'ACTIVE'
    ) a
    INNER JOIN (
      SELECT seller_id
      FROM follows
      WHERE follower_id = ${bidderBId}
        AND status = 'ACTIVE'
    ) b
      ON a.seller_id = b.seller_id
  `;

    return Number(result[0].count);
  }

  private async validateBidderAndSeller(
    bidderId: string,
    sellerId: string,
  ): Promise<void> {
    const [bidder, seller] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          userId: bidderId,
          role: Role.BIDDER,
          isBanned: false,
          isVerified: true,
        },
        select: { userId: true },
      }),

      this.prisma.user.findFirst({
        where: {
          userId: sellerId,
          role: Role.SELLER,
          isBanned: false,
          isVerified: true,
        },
        select: { userId: true },
      }),
    ]);

    if (!bidder) {
      throw new NotFoundException(ERROR_BIDDER_NOT_FOUND);
    }

    if (!seller) {
      throw new NotFoundException(ERROR_SELLER_NOT_FOUND);
    }
  }

  private toRelationshipStatus(
    follow: {
      followId: string;
      followerId: string;
      sellerId: string;
      status: FollowStatus;
    },
    currentUserId: string,
  ): RelationshipStatusResult {
    const isOutgoing = follow.followerId === currentUserId;

    switch (follow.status) {
      case FollowStatus.ACTIVE:
        return {
          status: isOutgoing
            ? RelationshipStatus.FOLLOWING
            : RelationshipStatus.ACCEPTED,
          friendshipId: follow.followId,
        };

      case FollowStatus.PENDING:
        return {
          status: isOutgoing
            ? RelationshipStatus.PENDING_OUTGOING
            : RelationshipStatus.PENDING_INCOMING,
          friendshipId: follow.followId,
        };

      case FollowStatus.BLOCKED:
        return {
          status: isOutgoing
            ? RelationshipStatus.BLOCKED
            : RelationshipStatus.BLOCKING,
          friendshipId: follow.followId,
        };

      default:
        return {
          status: RelationshipStatus.NONE,
        };
    }
  }

  private async resolveRelationship(
    currentUserId: string,
    targetUserId: string,
  ): Promise<RelationshipStatusResult> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        OR: [
          {
            followerId: currentUserId,
            sellerId: targetUserId,
          },
          {
            followerId: targetUserId,
            sellerId: currentUserId,
          },
        ],
      },
      select: {
        followId: true,
        followerId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!follow) {
      return { status: RelationshipStatus.NONE };
    }

    return this.toRelationshipStatus(follow, currentUserId);
  }

  private async resolveRelationships(
    currentUserId: string,
    targetUserIds: string[],
  ): Promise<Map<string, RelationshipStatusResult>> {
    const follows = await this.prisma.follow.findMany({
      where: {
        OR: [
          {
            followerId: currentUserId,
            sellerId: { in: targetUserIds },
          },
          {
            sellerId: currentUserId,
            followerId: { in: targetUserIds },
          },
        ],
      },
      select: {
        followId: true,
        followerId: true,
        sellerId: true,
        status: true,
      },
    });

    const map = new Map<string, RelationshipStatusResult>();
    for (const follow of follows) {
      const targetId =
        follow.followerId === currentUserId
          ? follow.sellerId
          : follow.followerId;

      map.set(targetId, this.toRelationshipStatus(follow, currentUserId));
    }

    return map;
  }

  private buildVisibilityFilter(viewerId?: string): FollowWhereInput {
    if (!viewerId) {
      return {};
    }

    return {
      seller: {
        followers: {
          none: {
            followerId: viewerId,
            status: FollowStatus.BLOCKED,
          },
        },
      },
    };
  }
}
