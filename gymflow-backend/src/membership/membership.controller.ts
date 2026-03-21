import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('members') // Using /members/:id/membership route mapping instead of /memberships to match PRD
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post(':id/membership')
  assignMembership(
    @Param('id') memberId: string,
    @Body() dto: CreateMembershipDto,
  ) {
    return this.membershipService.assignMembership(+memberId, dto);
  }

  @Get(':id/membership')
  getMembership(@Param('id') memberId: string) {
    return this.membershipService.getMembership(+memberId);
  }
}
