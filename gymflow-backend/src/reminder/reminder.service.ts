import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as twilio from 'twilio';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);
  private readonly twilioClient: twilio.Twilio;
  private readonly fromWhatsAppNumber: string;

  constructor(private prisma: PrismaService) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number
    } else {
      this.logger.warn('Twilio credentials not found. Reminders will only be logged, not sent.');
    }
  }

  // Helper method to format phone number for Twilio WhatsApp
  private formatWhatsAppNumber(phone: string): string {
    // Basic formatting: ensure it has country code if missing (assuming +91 for India)
    let formattedCode = phone.replace(/[^0-9]/g, '');
    if (formattedCode.length === 10) {
      formattedCode = `91${formattedCode}`;
    }
    return `whatsapp:+${formattedCode}`;
  }

  private async sendWhatsAppMessage(toPhone: string, message: string) {
    if (!this.twilioClient) {
      this.logger.log(`[DRY RUN] WhatsApp to ${toPhone}: ${message}`);
      return;
    }
    try {
      const waNumber = this.formatWhatsAppNumber(toPhone);
      await this.twilioClient.messages.create({
        body: message,
        from: this.fromWhatsAppNumber,
        to: waNumber,
      });
      this.logger.log(`Sent WhatsApp reminder to ${waNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${toPhone}: ${error.message}`);
    }
  }

  // Runs every day at 09:00 AM
  @Cron('0 9 * * *')
  async handleDailyReminders() {
    this.logger.log('Running daily reminder cron job...');
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);

    // Get due today
    const dueToday = await this.prisma.payments.findMany({
      where: {
        status: 'UNPAID',
        due_date: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999))
        }
      },
      include: { member: true }
    });

    // Get due in 2 days
    const dueInTwoDays = await this.prisma.payments.findMany({
      where: {
        status: 'UNPAID',
        due_date: {
          gte: new Date(twoDaysFromNow.setHours(0, 0, 0, 0)),
          lt: new Date(twoDaysFromNow.setHours(23, 59, 59, 999))
        }
      },
      include: { member: true }
    });

    // In a real app with WhatsApp API, this is where you call Twilio/meta API.
    // For MVP, we log the targets for manual action via the Dashboard.
    this.logger.log(`Found ${dueToday.length} payments due today and ${dueInTwoDays.length} due in 2 days.`);

    // Send reminders for those due today
    for (const p of dueToday) {
      const msg = `Hi ${p.member.name}, your GymFlow payment of ₹${p.amount} is due TODAY. Please settle it soon. Thank you!`;
      await this.sendWhatsAppMessage(p.member.phone, msg);
    }
    
    // Send reminders for those due in 2 days
    for (const p of dueInTwoDays) {
      const msg = `Hi ${p.member.name}, your GymFlow payment of ₹${p.amount} is due in 2 days. Kindly pay at the earliest.`;
      await this.sendWhatsAppMessage(p.member.phone, msg);
    }
  }

  // Manual Trigger Endpoint Handler
  async recordManualReminder(memberId: number) {
    const member = await this.prisma.members.findUnique({
      where: { id: memberId },
      include: { payments: { where: { status: 'UNPAID' } } }
    });
    
    if (!member) throw new NotFoundException('Member not found');

    const totalDue = member.payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // In future this will log to a `reminders_log` table
    this.logger.log(`Manual WhatsApp reminder clicked for ${member.name}. Total Due: ${totalDue}`);
    return { success: true, message: 'Reminder log recorded', totalDue };
  }
}
