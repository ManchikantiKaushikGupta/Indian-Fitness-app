import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private prisma: PrismaService) {}

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
    
    // Log them clearly
    dueToday.forEach((p: any) => {
      this.logger.log(`Target: ${p.member.name} (${p.member.phone}) | Due Today: ₹${p.amount}`);
    });
    dueInTwoDays.forEach((p: any) => {
      this.logger.log(`Target: ${p.member.name} (${p.member.phone}) | Due in 2 days: ₹${p.amount}`);
    });
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
