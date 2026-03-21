import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async assignMembership(memberId: number, dto: CreateMembershipDto) {
    const member = await this.prisma.members.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    if (new Date(dto.start_date) >= new Date(dto.end_date)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Expire any currently active memberships for this member to prevent overlap (optional but good idea)
    await this.prisma.memberships.updateMany({
      where: { member_id: memberId, status: 'Active' },
      data: { status: 'Expired' },
    });

    return this.prisma.memberships.create({
      data: {
        member_id: memberId,
        plan_type: dto.plan_type,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        status: 'Active',
      },
    });
  }

  async getMembership(memberId: number) {
    const membership = await this.prisma.memberships.findFirst({
      where: { member_id: memberId },
      orderBy: { id: 'desc' },
    });
    
    if (!membership) throw new NotFoundException('No membership found for this member');

    // Auto-update status if expired based on current date
    if (membership.status === 'Active' && new Date() > new Date(membership.end_date)) {
      const updated = await this.prisma.memberships.update({
        where: { id: membership.id },
        data: { status: 'Expired' },
      });
      return updated;
    }

    return membership;
  }
}
