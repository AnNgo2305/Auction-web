import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { FOLLOW_NOTIFICATION_QUEUE } from '@common/constants/queue.constant';
import { FollowAcceptEvent } from '@modules/follow/events/follow-accept.event';
import { FollowRequestEvent } from '@modules/follow/events/follow-request.event';
import { NotificationPayload } from '@modules/notification/constants/notification.constant';
import { NotificationType } from '@generated/prisma/enums';

@Injectable()
export class FollowNotificationListener {
  constructor(
    @InjectQueue(FOLLOW_NOTIFICATION_QUEUE.NAME)
    private readonly notificationQueue: Queue,
  ) {}

  @OnEvent(INTERNAL_EVENTS.FOLLOW_REQUESTED)
  async handleFollowRequested(payload: FollowRequestEvent): Promise<void> {
    const notificationPayload: NotificationPayload = {
      recipientId: payload.sellerId,
      actorId: payload.bidderId,
      type: NotificationType.FOLLOW_REQUEST,
      entityId: payload.bidderId,
      entityType: 'user',
    };

    await this.notificationQueue.add(
      FOLLOW_NOTIFICATION_QUEUE.JOBS.FOLLOW_REQUESTED,
      notificationPayload,
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  @OnEvent(INTERNAL_EVENTS.FOLLOW_ACCEPTED)
  async handleFollowAccepted(payload: FollowAcceptEvent): Promise<void> {
    const notificationPayload: NotificationPayload = {
      recipientId: payload.bidderId,
      actorId: payload.sellerId,
      type: NotificationType.FOLLOW_ACCEPTED,
      entityId: payload.sellerId,
      entityType: 'user',
    };

    await this.notificationQueue.add(
      FOLLOW_NOTIFICATION_QUEUE.JOBS.FOLLOW_ACCEPTED,
      notificationPayload,
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }
}
