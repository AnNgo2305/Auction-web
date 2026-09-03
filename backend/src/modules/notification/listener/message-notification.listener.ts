import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { MESSAGE_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { MessageSentEvent } from '@modules/chat/events/message-sent.event';
import { NotificationService } from '@modules/notification/notification.service';
import { NotificationPayload } from '@modules/notification/constants/notification.constant';
import { NotificationType } from '@generated/prisma/enums';

const MESSAGE_AGGREGATION_DELAY_MS = 10_000;

@Injectable()
export class MessageNotificationListener {
  constructor(
    @InjectQueue(MESSAGE_NOTIFICATION_QUEUE.NAME)
    private readonly notificationQueue: Queue,
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent(INTERNAL_EVENTS.MESSAGE_SENT)
  async handleMessageSent(payload: MessageSentEvent): Promise<void> {
    const notificationPayload: NotificationPayload = {
      recipientId: payload.recipientId,
      actorId: payload.senderId,
      type: NotificationType.MESSAGE,
      entityId: payload.conversationId,
      entityType: 'conversation',
    };

    await this.notificationService.addAggregationActor(notificationPayload);

    await this.notificationQueue.add(
      MESSAGE_NOTIFICATION_QUEUE.JOBS.MESSAGE_SENT,
      notificationPayload,
      {
        delay: MESSAGE_AGGREGATION_DELAY_MS,
        jobId: `message:${notificationPayload.recipientId}:${notificationPayload.type}:${notificationPayload.entityId}`,
      },
    );
  }
}
