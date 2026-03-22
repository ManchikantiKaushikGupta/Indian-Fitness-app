import { Test, TestingModule } from '@nestjs/testing';
import { ReminderService } from './reminder.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  payments: {
    findMany: jest.fn(),
  },
  members: {
    findUnique: jest.fn(),
  }
};

describe('ReminderService', () => {
  let service: ReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<ReminderService>(ReminderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate total due for a manual reminder', async () => {
    const fakeMember = {
      id: 1,
      name: 'John Doe',
      payments: [
        { amount: 500, status: 'UNPAID' },
        { amount: 200, status: 'UNPAID' }
      ]
    };
    (mockPrismaService.members.findUnique as jest.Mock).mockResolvedValue(fakeMember);
    
    const result = await service.recordManualReminder(1);
    expect(result.success).toBe(true);
    expect(result.totalDue).toBe(700);
  });
});

