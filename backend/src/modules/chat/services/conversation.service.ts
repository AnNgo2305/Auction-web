import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import {
  CONVERSATION_SELECT,
  ERROR_CANNOT_CREATE_CONVERSATION_WITH_SELF,
  ERROR_CONVERSATION_CREATION_TIMEOUT,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_RECIPIENT_NOT_FOUND,
} from '@modules/chat/constants/conversation.constant';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_LOCK } from '@common/constants/redis.constant';
import { ConversationResponseDto } from '@modules/chat/dtos/conversation/get-create-conversation.response.dto';
import { GetConversationsResponseDto } from '@modules/chat/dtos/conversation/get-user-conversations.response.dto';
import { SearchConversationsResponseDto } from '@modules/chat/dtos/conversation/search-conversations.response.dto';
import { Prisma } from '@generated/prisma/client';
import { FileService } from '@common/services/file.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async createOrGetConversation(
    currentUserId: string,
    recipientId: string,
  ): Promise<ConversationResponseDto> {
    this.logger.log(
      `[CHAT] create conversation request: ${currentUserId} -> ${recipientId}`,
    );

    if (currentUserId === recipientId) {
      this.logger.warn(
        `[CHAT] create conversation failed: self conversation (${currentUserId})`,
      );

      throw new ConflictException(ERROR_CANNOT_CREATE_CONVERSATION_WITH_SELF);
    }

    const recipient = await this.prisma.user.findUnique({
      where: {
        userId: recipientId,
      },
      select: {
        userId: true,
      },
    });

    if (!recipient) {
      this.logger.warn(`[CHAT] recipient not found: ${recipientId}`);

      throw new NotFoundException(ERROR_RECIPIENT_NOT_FOUND);
    }

    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            initiatorId: currentUserId,
            recipientId,
          },
          {
            initiatorId: recipientId,
            recipientId: currentUserId,
          },
        ],
      },
      select: CONVERSATION_SELECT,
    });

    if (existingConversation) {
      const isInitiator =
        existingConversation.initiator.userId === currentUserId;

      const isDeleted = isInitiator
        ? existingConversation.deletedByInitiatorAt !== null
        : existingConversation.deletedByRecipientAt !== null;

      if (isDeleted) {
        const restoredConversation = await this.prisma.conversation.update({
          where: {
            conversationId: existingConversation.conversationId,
          },
          data: isInitiator
            ? {
                deletedByInitiatorAt: null,
              }
            : {
                deletedByRecipientAt: null,
              },
          select: CONVERSATION_SELECT,
        });

        this.logger.log(
          `[CHAT] conversation restored: ${restoredConversation.conversationId}`,
        );

        return this.mapConversation(restoredConversation, currentUserId);
      }

      this.logger.log(
        `[CHAT] existing conversation found: ${existingConversation.conversationId}`,
      );
      return this.mapConversation(existingConversation, currentUserId);
    }

    const lockKey = this.getConversationLockKey(currentUserId, recipientId);
    const locked = await this.acquireLock(lockKey);

    if (!locked) {
      const { MAX_RETRY, INTERVAL } = REDIS_LOCK.CONVERSATION.WAIT;
      for (let i = 0; i < MAX_RETRY; i++) {
        await new Promise((resolve) => setTimeout(resolve, INTERVAL));
        const retryConversation = await this.prisma.conversation.findFirst({
          where: {
            OR: [
              {
                initiatorId: currentUserId,
                recipientId,
              },
              {
                initiatorId: recipientId,
                recipientId: currentUserId,
              },
            ],
          },
          select: CONVERSATION_SELECT,
        });
        if (retryConversation) {
          return this.mapConversation(retryConversation, currentUserId);
        }
      }
      throw new ConflictException(ERROR_CONVERSATION_CREATION_TIMEOUT);
    }

    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          initiatorId: currentUserId,
          recipientId,
        },
        select: CONVERSATION_SELECT,
      });
      this.logger.log(
        `[CHAT] conversation created: ${conversation.conversationId}`,
      );

      return this.mapConversation(conversation, currentUserId);
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async searchConversations({
    currentUserId,
    query,
    cursor,
    limit = 10,
  }: {
    currentUserId: string;
    query: string;
    cursor?: string;
    limit?: number;
  }): Promise<SearchConversationsResponseDto> {
    this.logger.log(
      `[SEARCH_CONVERSATIONS] user=${currentUserId} search="${query}" cursor=${cursor ?? 'null'} limit=${limit}`,
    );

    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          {
            initiatorId: currentUserId,
            deletedByInitiatorAt: null,
            recipient: {
              username: { contains: query },
            },
          },
          {
            recipientId: currentUserId,
            deletedByRecipientAt: null,
            initiator: {
              username: { contains: query },
            },
          },
        ],
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          conversationId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        conversationId: 'desc',
      },
      select: {
        conversationId: true,
        initiatorId: true,
        recipientId: true,
        initiator: {
          select: {
            username: true,
            userId: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
        recipient: {
          select: {
            username: true,
            userId: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = conversations.length > limit;
    const sliced = hasMore ? conversations.slice(0, limit) : conversations;

    return {
      conversations: sliced.map((conversation) => {
        const otherUser =
          conversation.initiatorId === currentUserId
            ? conversation.recipient
            : conversation.initiator;
        return {
          conversationId: conversation.conversationId,
          username: otherUser.username,
          userId: otherUser.userId,
          profileImageUrl: this.getPublicProfileImageUrl(
            otherUser.profile?.profileImageUrl,
          ),
        };
      }),
      nextCursor: hasMore ? sliced[sliced.length - 1].conversationId : null,
    };
  }

  async getUserConversations({
    currentUserId,
    lastMessageAt,
    conversationId,
    limit = 10,
  }: {
    currentUserId: string;
    lastMessageAt?: string;
    conversationId?: string;
    limit?: number;
  }): Promise<GetConversationsResponseDto> {
    this.logger.log(
      `[GET_CONVERSATIONS] user=${currentUserId} lastMessageAt=${lastMessageAt ?? 'null'} conversationId=${conversationId ?? 'null'} limit=${limit}`,
    );

    const conversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                initiatorId: currentUserId,
                deletedByInitiatorAt: null,
              },
              {
                recipientId: currentUserId,
                deletedByRecipientAt: null,
              },
            ],
          },
          ...(lastMessageAt && conversationId
            ? [
                {
                  OR: [
                    {
                      lastMessageAt: {
                        lt: new Date(lastMessageAt),
                      },
                    },
                    {
                      lastMessageAt: new Date(lastMessageAt),
                      conversationId: {
                        lt: conversationId,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      take: limit + 1,
      orderBy: [
        {
          lastMessageAt: 'desc',
        },
        {
          conversationId: 'desc',
        },
      ],
      select: {
        conversationId: true,
        initiatorId: true,
        recipientId: true,
        lastMessageAt: true,
        initiator: {
          select: {
            userId: true,
            username: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
        recipient: {
          select: {
            userId: true,
            username: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
        lastMessage: {
          select: {
            messageId: true,
            content: true,
            type: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    });

    const hasMore = conversations.length > limit;

    const sliced = hasMore ? conversations.slice(0, limit) : conversations;

    if (sliced.length === 0) {
      return {
        conversations: [],
        nextCursor: null,
      };
    }

    const conversationIds = sliced.map(
      (conversation) => conversation.conversationId,
    );

    const unreadMessages = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderId: {
          not: currentUserId,
        },
        isRead: false,
      },
      _count: {
        messageId: true,
      },
    });

    const unreadCountMap = new Map(
      unreadMessages.map((item) => [
        item.conversationId,
        item._count.messageId,
      ]),
    );

    return {
      conversations: sliced.map((conversation) => {
        const otherUser =
          conversation.initiatorId === currentUserId
            ? conversation.recipient
            : conversation.initiator;

        return {
          conversationId: conversation.conversationId,

          otherUser: {
            userId: otherUser.userId,
            username: otherUser.username,
            profileImageUrl: this.getPublicProfileImageUrl(
              otherUser.profile?.profileImageUrl,
            ),
          },

          lastMessage: conversation.lastMessage,
          unreadCount: unreadCountMap.get(conversation.conversationId) ?? 0,
        };
      }),

      nextCursor: hasMore
        ? {
            lastMessageAt:
              sliced[sliced.length - 1].lastMessageAt!.toISOString(),
            conversationId: sliced[sliced.length - 1].conversationId,
          }
        : null,
    };
  }

  async deleteConversation(
    currentUserId: string,
    conversationId: string,
  ): Promise<void> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        conversationId,
        OR: [
          {
            initiatorId: currentUserId,
          },
          {
            recipientId: currentUserId,
          },
        ],
      },
      select: {
        conversationId: true,
        initiatorId: true,
        recipientId: true,
        deletedByInitiatorAt: true,
        deletedByRecipientAt: true,
      },
    });

    if (!conversation) {
      this.logger.warn(`[CHAT] conversation not found: ${conversationId}`);
      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const isInitiator = conversation.initiatorId === currentUserId;
    const isAlreadyDeleted = isInitiator
      ? conversation.deletedByInitiatorAt !== null
      : conversation.deletedByRecipientAt !== null;
    if (isAlreadyDeleted) {
      this.logger.warn(
        `[CHAT] conversation already deleted by user: ${currentUserId}`,
      );

      throw new ConflictException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const isDeletedByOtherUser = isInitiator
      ? conversation.deletedByRecipientAt !== null
      : conversation.deletedByInitiatorAt !== null;

    if (isDeletedByOtherUser) {
      await this.prisma.conversation.delete({
        where: {
          conversationId,
        },
      });

      this.logger.log(
        `[CHAT] conversation hard deleted after both users deleted: ${conversationId}`,
      );

      return;
    }

    await this.prisma.conversation.update({
      where: {
        conversationId,
      },
      data: isInitiator
        ? {
            deletedByInitiatorAt: new Date(),
          }
        : {
            deletedByRecipientAt: new Date(),
          },
    });

    this.logger.log(
      `[CHAT] conversation soft deleted by user: ${currentUserId}`,
    );
  }

  async getUserConversationIds(userId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          {
            initiatorId: userId,
            deletedByInitiatorAt: null,
          },
          {
            recipientId: userId,
            deletedByRecipientAt: null,
          },
        ],
      },
      select: {
        conversationId: true,
      },
    });

    return conversations.map((conversation) => conversation.conversationId);
  }

  async getConversationById(
    currentUserId: string,
    conversationId: string,
  ): Promise<ConversationResponseDto> {
    this.logger.log(
      `[GET_CONVERSATION] user=${currentUserId} conversation=${conversationId}`,
    );

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        conversationId,
        OR: [
          {
            initiatorId: currentUserId,
          },
          {
            recipientId: currentUserId,
          },
        ],
      },
      select: CONVERSATION_SELECT,
    });

    if (!conversation) {
      this.logger.warn(`[CHAT] conversation not found: ${conversationId}`);

      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const isInitiator = conversation.initiator.userId === currentUserId;

    const isCurrentUserDeleted = isInitiator
      ? conversation.deletedByInitiatorAt !== null
      : conversation.deletedByRecipientAt !== null;

    if (isCurrentUserDeleted) {
      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    return this.mapConversation(conversation, currentUserId);
  }

  private async acquireLock(key: string): Promise<boolean> {
    const result = await this.redis.set(
      key,
      REDIS_LOCK.CONVERSATION.VALUE,
      'EX',
      REDIS_LOCK.CONVERSATION.TTL,
      'NX',
    );

    return result === 'OK';
  }

  private getConversationLockKey(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `${REDIS_LOCK.CONVERSATION.PREFIX}:${sortedIds[0]}:${sortedIds[1]}`;
  }

  private mapConversation(
    conversation: Prisma.ConversationGetPayload<{
      select: typeof CONVERSATION_SELECT;
    }>,
    currentUserId: string,
  ): ConversationResponseDto {
    const isInitiator = conversation.initiator.userId === currentUserId;

    const isDeleted = isInitiator
      ? conversation.deletedByRecipientAt !== null
      : conversation.deletedByInitiatorAt !== null;

    return {
      conversationId: conversation.conversationId,
      initiator: {
        userId: conversation.initiator.userId,
        username: conversation.initiator.username,
        profileImageUrl: this.getPublicProfileImageUrl(
          conversation.initiator.profile?.profileImageUrl,
        ),
      },
      recipient: {
        userId: conversation.recipient.userId,
        username: conversation.recipient.username,
        profileImageUrl: this.getPublicProfileImageUrl(
          conversation.recipient.profile?.profileImageUrl,
        ),
      },
      lastMessage: conversation.lastMessage
        ? {
            messageId: conversation.lastMessage.messageId,
            content: conversation.lastMessage.content,
            type: conversation.lastMessage.type,
            senderId: conversation.lastMessage.senderId,
            createdAt: conversation.lastMessage.createdAt,
          }
        : null,
      isDeleted,
    };
  }

  private getPublicProfileImageUrl(
    profileImageUrl: string | null | undefined,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    return this.fileService.getPublicUrl(profileImageUrl);
  }
}
