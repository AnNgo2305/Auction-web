import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  EXPIRES_IN_MINUTES,
  MailSubjects,
  MailTitles,
  MailType,
  MailTemplates,
} from '@common/constants/mail.constant';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from '@common/config/mail.config';

@Injectable()
export class MailService {
  private readonly from: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    const mailConfig =
      this.configService.getOrThrow<MailConfig['mail']>('mail');

    this.from = mailConfig.from;
  }

  async sendMail(to: string, otpCode: string, type: MailType): Promise<void> {
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
        from: this.from,
        to,
        subject,
        template,
        context,
      });
    } catch (error: unknown) {
      console.error('MAIL ERROR:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
