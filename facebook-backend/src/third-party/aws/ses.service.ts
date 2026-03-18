import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsSesService {
  private sesClient: SESClient;

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_SES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_SES_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SES_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    body: string,
    html: string,
  ) {
    const params = {
      Destination: {
        ToAddresses: [to], // recipient email address
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html, // Email body in HTML
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject, // Subject of the email
        },
      },
      Source: from,
    };

    try {
      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
