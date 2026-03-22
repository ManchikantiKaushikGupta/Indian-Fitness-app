import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  payments: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  members: {
    findUnique: jest.fn(),
  }
};

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get unpaid payments', async () => {
    const fakePayments = [{ id: 1, amount: 500, status: 'UNPAID' }];
    (prisma.payments.findMany as jest.Mock).mockResolvedValue(fakePayments);
    const result = await service.getUnpaidPayments();
    expect(result).toEqual(fakePayments);
    expect(prisma.payments.findMany).toHaveBeenCalledWith({
      where: { status: 'UNPAID' },
      include: { member: true },
    });
  });
});

