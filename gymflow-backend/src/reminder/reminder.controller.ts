import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post('test-cron')
  testCronJob() {
    // This allows us to manually trigger the daily cron logic via API for testing
    this.reminderService.handleDailyReminders();
    return { success: true, message: 'Cron job logic triggered for testing.' };
  }

  @Post('send/:memberId')
  sendManualReminder(@Param('memberId') memberId: string) {
    return this.reminderService.recordManualReminder(+memberId);
  }
}
