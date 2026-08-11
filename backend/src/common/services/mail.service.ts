import { Injectable } from '@nestjs/common';
import { MailType } from '@common/constants/mail.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_QUEUE } from '@common/constants/queue.constant';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(MAIL_QUEUE.NAME)
    private readonly mailQueue: Queue,
  ) {}

  async sendMail(to: string, otpCode: string, type: MailType): Promise<void> {
    await this.mailQueue.add(MAIL_QUEUE.JOBS.SEND_MAIL, {
      to,
      otpCode,
      type,
    });
  }
}
