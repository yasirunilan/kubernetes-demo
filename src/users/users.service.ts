import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(): Promise<User> {
    const randomString = Math.random().toString(36).substring(7);
    const user = {
      firstName: `User${randomString}`,
      lastName: 'Test',
      email: `user${randomString}@yasiru.com`,
    };

    return this.prisma.user.create({
      data: user,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
