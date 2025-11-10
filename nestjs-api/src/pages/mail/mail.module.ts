import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule, // Ensures env variables are loaded
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const gmailEmail = configService.get<string>('GMAIL_EMAIL');
        const gmailPassword = configService.get<string>('GMAIL_APP_PASSWORD');

        // If email credentials are not configured, use a mock transport
        if (!gmailEmail || !gmailPassword) {
          console.warn(
            'Gmail credentials not configured. Email functionality will be disabled.',
          );
          return {
            transport: {
              jsonTransport: true, // Mock transport for development
            },
            defaults: {
              from: '"System Name" <noreply@example.com>',
            },
          };
        }

        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: gmailEmail,
              pass: gmailPassword,
            },
          },
          defaults: {
            from: `"System Name" <${gmailEmail}>`,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
