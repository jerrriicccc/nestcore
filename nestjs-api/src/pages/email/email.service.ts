import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `http://localhost:3000/auth/verify/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'System Name: Verify your email address',
      html: `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #333;">
          <!-- Logo -->
          <div style="text-align: center; padding: 20px 0;">
            <img src="http://localhost:3000/public/assets/images/bivmc_logo.png" alt="Your Logo" width="100"/>
          </div>
  
          <!-- Title -->
          <h2 style="text-align: center; font-size: 24px; color: #333;">Verify your email address</h2>
  
          <!-- Message -->
          <p style="text-align: center; font-size: 16px; color: #333;">
            To start using <strong>System Name</strong>, simply click the <strong>Verify Email</strong> button below:
          </p>
  
          <!-- Button -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" 
              style="display: inline-block; background: #000; color: #fff; padding: 12px 20px; 
              font-size: 16px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
  
          <!-- Help Center -->
          <p style="text-align: center; font-size: 14px; color: #333;">
            Questions? Visit our <a href="https://payables.bivmc.com.ph/" style="color: #000;">Help Center</a>.
          </p>
  
          <!-- Footer -->
          <hr style="margin: 20px 0; border: 0.5px solid #ccc;">
          <p style="text-align: center; font-size: 12px; color: #666;">
            Your App is a platform designed to [describe purpose]. Helping users achieve [something meaningful].
          </p>
  
          <!-- Address -->
          <p style="text-align: center; font-size: 12px; color: #666; margin-top: 10px;">
            (BIVMC). Retelco Drive., Cor. E. Rodriguez Ave. (C5), Brgy. Bagong Ilog Pasig City, Philippines
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `http://localhost:3000/auth/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" 
           style="background: #f44336; padding: 10px 15px; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}
