import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    return this.prisma.members.create({
      data: {
        name: createMemberDto.name,
        phone: createMemberDto.phone,
        gym_id: createMemberDto.gym_id || 1,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 10) {
    const [data, total] = await Promise.all([
      this.prisma.members.findMany({
        skip,
        take,
        orderBy: { join_date: 'desc' },
      }),
      this.prisma.members.count(),
    ]);
    return { data, total, skip, take };
  }

  async findOne(id: number) {
    const member = await this.prisma.members.findUnique({
      where: { id },
      include: { memberships: true, payments: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    try {
      return await this.prisma.members.update({
        where: { id },
        data: updateMemberDto,
      });
    } catch (e) {
      throw new NotFoundException('Member not found');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.members.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Member not found');
    }
  }
}
