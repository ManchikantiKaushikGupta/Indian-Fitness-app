import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get('unpaid')
  findUnpaid() {
    return this.paymentService.findUnpaid();
  }

  @Get('history/:memberId')
  findHistoryByMember(@Param('memberId') memberId: string) {
    return this.paymentService.findHistoryByMember(+memberId);
  }
}
