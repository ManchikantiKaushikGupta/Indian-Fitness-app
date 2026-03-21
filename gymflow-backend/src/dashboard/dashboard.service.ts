import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(gymId: number = 1) { // Defaulting to gym_id 1 for MVP
    const now = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(now.getDate() + 7); // 7 days from now

    const [total_members, active_members, pending_payments, expiring_soon] = await Promise.all([
      // Total members
      this.prisma.members.count({ where: { gym_id: gymId } }),
      
      // Active memberships
      this.prisma.memberships.count({
        where: {
          member: { gym_id: gymId },
          status: 'Active',
          end_date: { gte: now }
        }
      }),

      // Pending payments count (number of unpaid records)
      this.prisma.payments.count({
        where: {
          member: { gym_id: gymId },
          status: 'UNPAID'
        }
      }),

      // Expiring soon (Active memberships ending within next 7 days)
      this.prisma.memberships.count({
        where: {
          member: { gym_id: gymId },
          status: 'Active',
          end_date: {
            gte: now,
            lte: expiryThreshold
          }
        }
      })
    ]);

    return {
      total_members,
      active_members,
      pending_payments,
      expiring_soon
    };
  }
}
