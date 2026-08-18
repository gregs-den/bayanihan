import {Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.category.create({
        data: { name },
    });
  }

    async findAll() {
      return this.prisma.category.findMany();
    } 

    async findOne(id: number) {
      const category = await this.prisma.category.findUnique({
          where: { id },
      });

      if (!category) {
          throw new NotFoundException('Category not found');
      }

      return category;
    }

    async update(id: number, name: string) {
      await this.findOne(id); // reuse the check above

      return this.prisma.category.update({
          where: { id },
          data: { name },
      });
    }

    async remove(id: number) {
      await this.findOne(id); // reuse the check above

      return this.prisma.category.delete({
          where: { id },
      });
    }
  }
