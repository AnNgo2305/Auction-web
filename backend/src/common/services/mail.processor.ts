import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  EXPIRES_IN_MINUTES,
  MailSubjects,
  MailTitles,
  MailType,
  MailTemplates,
} from '@common/constants/mail.constant';
import mailConfig from '@common/config/mail.config';
import { ConfigType } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { LoggerService } from '@common/services/logger.service';
import { MAIL_QUEUE } from '@common/constants/queue.constant';
import { Job } from 'bullmq';

interface SendMailJob {
  to: string;
  otpCode: string;
  type: MailType;
}

@Processor(MAIL_QUEUE.NAME)
@Injectable()
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: LoggerService,

    @Inject(mailConfig.KEY)
    private readonly mail: ConfigType<typeof mailConfig>,
  ) {
    super();
  }

  async process(job: Job<SendMailJob>): Promise<void> {
    switch (job.name) {
      case MAIL_QUEUE.JOBS.SEND_MAIL:
        await this.handleSendMail(job);
        break;

      default:
        this.logger.warn(`Unknown mail job: ${job.name}`);
    }
  }

  private async handleSendMail(job: Job<SendMailJob>): Promise<void> {
    const { to, otpCode, type } = job.data;
    try {
      const subject = MailSubjects[type];
      const title = MailTitles[type];
      const template = MailTemplates[type];

      const context = {
        title,
        otpCode,
        expireMinutes: EXPIRES_IN_MINUTES,
      };

      await this.mailerService.sendMail({
        from: this.mail.from,
        to,
        subject,
        template,
        context,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
