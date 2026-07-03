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

@Injectable()
export class MailService {
  private readonly from: string;

  constructor(
    private readonly mailerService: MailerService,

    @Inject(mailConfig.KEY)
    mail: ConfigType<typeof mailConfig>,
  ) {
    this.from = mail.from;
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
