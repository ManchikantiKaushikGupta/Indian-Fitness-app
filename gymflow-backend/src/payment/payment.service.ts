import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const member = await this.prisma.members.findUnique({
      where: { id: createPaymentDto.member_id },
    });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.payments.create({
      data: {
        member_id: createPaymentDto.member_id,
        amount: createPaymentDto.amount,
        due_date: new Date(createPaymentDto.due_date),
        status: createPaymentDto.status,
        paid_date: createPaymentDto.paid_date ? new Date(createPaymentDto.paid_date) : null,
      },
    });
  }

  async findUnpaid() {
    return this.prisma.payments.findMany({
      where: { status: 'UNPAID' },
      include: {
        member: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { due_date: 'asc' },
    });
  }

  async findHistoryByMember(memberId: number) {
    return this.prisma.payments.findMany({
      where: { member_id: memberId },
      orderBy: { due_date: 'desc' },
    });
  }
}
