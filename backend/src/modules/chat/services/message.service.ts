import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_CONVERSATION_NOT_FOUND } from '@modules/chat/constants/conversation.constant';
import { CreateMessageDto } from '@modules/chat/dtos/message/create-message.body.dto';
import {
  ERROR_CANNOT_EDIT_MESSAGE,
  ERROR_MESSAGE_NOT_FOUND,
  ERROR_ONLY_TEXT_MESSAGE_CAN_BE_EDITED,
  ERROR_REPLY_MESSAGE_NOT_FOUND,
  MESSAGE_SELECT,
} from '@modules/chat/constants/message.constant';
import { MessageResponseDto } from '@modules/chat/dtos/message/message.response.dto';
import { MessageType } from '@generated/prisma/enums';
import { GetMessagesResponseDto } from '@modules/chat/dtos/message/get-messages.response.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async sendMessage(
    currentUserId: string,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    this.logger.log(
      `[CHAT] send message: ${currentUserId} -> ${dto.conversationId}`,
    );

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        conversationId: dto.conversationId,
        OR: [
          {
            initiatorId: currentUserId,
          },
          {
            recipientId: currentUserId,
          },
        ],
        deletedByInitiatorAt: null,
        deletedByRecipientAt: null,
      },
      select: {
        conversationId: true,
        initiatorId: true,
        recipientId: true,
      },
    });

    if (!conversation) {
      this.logger.warn(`[CHAT] conversation not found: ${dto.conversationId}`);

      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const recipientId =
      conversation.initiatorId === currentUserId
        ? conversation.recipientId
        : conversation.initiatorId;

    const message = await this.prisma.$transaction(async (tx) => {
      if (dto.replyToMessageId) {
        const repliedMessage = await tx.message.findFirst({
          where: {
            messageId: dto.replyToMessageId,
            conversationId: dto.conversationId,
          },
          select: {
            messageId: true,
          },
        });

        if (!repliedMessage) {
          throw new NotFoundException(ERROR_REPLY_MESSAGE_NOT_FOUND);
        }
      }

      const createdMessage = await tx.message.create({
        data: {
          conversationId: dto.conversationId,
          senderId: currentUserId,
          type: dto.type,
          content: dto.content,
          fileKey: dto.fileKey,
          fileName: dto.fileName,
          mimeType: dto.mimeType,
          fileSize: dto.fileSize,
          replyToMessageId: dto.replyToMessageId,
        },
        select: MESSAGE_SELECT,
      });

      await tx.conversation.update({
        where: {
          conversationId: dto.conversationId,
        },
        data: {
          lastMessageId: createdMessage.messageId,
          lastMessageAt: createdMessage.createdAt,
        },
      });

      return createdMessage;
    });

    this.logger.log(`[CHAT] message created: ${message.messageId}`);
    return {
      ...message,
      recipientId,
    };
  }

  async deleteMessage(currentUserId: string, messageId: string): Promise<void> {
    this.logger.log(`[CHAT] delete message: ${messageId} by ${currentUserId}`);

    await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.findFirst({
        where: {
          messageId,
          senderId: currentUserId,
        },
        select: {
          messageId: true,
          conversationId: true,
        },
      });

      if (!message) {
        this.logger.warn(`[CHAT] message not found: ${messageId}`);
        throw new NotFoundException(ERROR_MESSAGE_NOT_FOUND);
      }

      const conversation = await tx.conversation.findFirst({
        where: {
          conversationId: message.conversationId,
          deletedByInitiatorAt: null,
          deletedByRecipientAt: null,
        },
        select: {
          lastMessageId: true,
        },
      });

      if (!conversation) {
        this.logger.warn(
          `[CHAT] conversation not found or deleted: ${message.conversationId}`,
        );

        throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
      }

      await tx.message.delete({
        where: {
          messageId,
        },
      });

      if (conversation.lastMessageId === messageId) {
        const latestMessage = await tx.message.findFirst({
          where: {
            conversationId: message.conversationId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            messageId: true,
          },
        });

        await tx.conversation.update({
          where: {
            conversationId: message.conversationId,
          },
          data: {
            lastMessageId: latestMessage?.messageId ?? null,
          },
        });
      }
    });

    this.logger.log(`[CHAT] message deleted: ${messageId}`);
  }

  async updateMessage(
    currentUserId: string,
    messageId: string,
    content: string,
  ): Promise<MessageResponseDto> {
    this.logger.log(`[CHAT] update message: ${messageId} by ${currentUserId}`);

    const updatedMessage = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.findUnique({
        where: {
          messageId,
        },
        select: {
          messageId: true,
          senderId: true,
          type: true,
          conversationId: true,
        },
      });

      if (!message) {
        this.logger.warn(`[CHAT] message not found: ${messageId}`);
        throw new NotFoundException(ERROR_MESSAGE_NOT_FOUND);
      }

      if (message.senderId !== currentUserId) {
        throw new ForbiddenException(ERROR_CANNOT_EDIT_MESSAGE);
      }

      if (message.type !== MessageType.TEXT) {
        throw new BadRequestException(ERROR_ONLY_TEXT_MESSAGE_CAN_BE_EDITED);
      }

      const conversation = await tx.conversation.findFirst({
        where: {
          conversationId: message.conversationId,
          deletedByInitiatorAt: null,
          deletedByRecipientAt: null,
        },
        select: {
          conversationId: true,
        },
      });

      if (!conversation) {
        this.logger.warn(
          `[CHAT] conversation not found or deleted: ${message.conversationId}`,
        );

        throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
      }

      return tx.message.update({
        where: {
          messageId,
        },
        data: {
          content,
        },
        select: MESSAGE_SELECT,
      });
    });

    this.logger.log(`[CHAT] message updated: ${messageId}`);

    return updatedMessage;
  }

  async getMessages(
    currentUserId: string,
    conversationId: string,
    cursor?: string,
    limit = 10,
  ): Promise<GetMessagesResponseDto> {
    this.logger.log(
      `[GET_MESSAGES] conversation=${conversationId} user=${currentUserId} cursor=${cursor ?? 'null'} limit=${limit}`,
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
      select: {
        conversationId: true,
      },
    });

    if (!conversation) {
      this.logger.warn(`[CHAT] conversation not found: ${conversationId}`);

      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          messageId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        messageId: 'desc',
      },
      select: MESSAGE_SELECT,
    });

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;

    this.logger.log(
      `[GET_MESSAGES] found=${sliced.length} hasMore=${hasMore} conversation=${conversationId}`,
    );

    return {
      messages: sliced,
      nextCursor: hasMore ? sliced[sliced.length - 1].messageId : null,
    };
  }

  async getMessageById(messageId: string): Promise<MessageResponseDto> {
    this.logger.log(`[CHAT] get message: ${messageId}`);
    const message = await this.prisma.message.findUnique({
      where: {
        messageId,
      },
      select: MESSAGE_SELECT,
    });

    if (!message) {
      this.logger.warn(`[CHAT] message not found: ${messageId}`);
      throw new NotFoundException(ERROR_MESSAGE_NOT_FOUND);
    }

    return message;
  }

  async readMessage(
    currentUserId: string,
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    this.logger.log(`[CHAT] read message: ${messageId} by ${currentUserId}`);

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
      },
    });

    if (!conversation) {
      this.logger.warn(`[CHAT] conversation not found: ${conversationId}`);
      throw new NotFoundException(ERROR_CONVERSATION_NOT_FOUND);
    }

    const message = await this.prisma.message.findFirst({
      where: {
        messageId,
        conversationId,
      },
      select: {
        messageId: true,
        senderId: true,
        isRead: true,
      },
    });

    if (!message) {
      this.logger.warn(`[CHAT] message not found: ${messageId}`);
      throw new NotFoundException(ERROR_MESSAGE_NOT_FOUND);
    }

    if (message.isRead) {
      return;
    }

    await this.prisma.message.update({
      where: {
        messageId,
      },
      data: {
        isRead: true,
      },
    });

    this.logger.log(
      `[CHAT] message marked as read: ${messageId} by ${currentUserId}`,
    );
  }
}
