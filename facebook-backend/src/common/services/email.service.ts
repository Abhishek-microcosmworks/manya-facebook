import { Injectable } from '@nestjs/common';
import { sendTextMailInterface } from '../interfaces';
import { AwsSesService } from 'src/third-party/aws';

@Injectable()
export class EmailService {
  constructor(private readonly sesService: AwsSesService) {}

  async sendTextMail({
    toEmail,
    fromEmail,
    subject,
    textBody,
    html,
  }: sendTextMailInterface) {
    try {
      await this.sesService.sendEmail(
        toEmail,
        fromEmail,
        subject,
        textBody,
        html,
      );
    } catch (error) {
      throw error;
    }
  }
}
