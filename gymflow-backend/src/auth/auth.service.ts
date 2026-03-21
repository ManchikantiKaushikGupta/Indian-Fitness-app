import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const owner = await this.prisma.gym_owner.findUnique({
      where: { email: loginDto.email },
    });

    if (!owner) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, owner.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: owner.email, sub: owner.id };
    return {
      access_token: this.jwtService.sign(payload),
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
    };
  }

  // Helper method to create initial owner if needed (not strict MVP but useful for testing)
  async register(loginDto: LoginDto, name: string = 'Admin') {
    const hashedPassword = await bcrypt.hash(loginDto.password, 10);
    const owner = await this.prisma.gym_owner.create({
      data: {
        email: loginDto.email,
        password_hash: hashedPassword,
        name,
      },
    });
    return { message: 'Admin created successfully', ownerId: owner.id };
  }
}
