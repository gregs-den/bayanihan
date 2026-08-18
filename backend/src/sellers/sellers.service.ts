import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellersService {
    constructor(private readonly prisma: PrismaService) {}

    async createSeller(userId: number, storeName: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.seller.create({
            data: {
                userId: user.id,
                storeName,
            },
        });
    }

    async findAll() {
        return this.prisma.seller.findMany();
    }

    async findOne(id: number) {
        const seller = await this.prisma.seller.findUnique({
            where: { id },
        });

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        return seller;
    }

    async update(id: number, storeName: string, requestingUserId: number) {
        const seller = await this.findOne(id);

        if (seller.userId !== requestingUserId) {
            throw new ForbiddenException('You can only update you own seller profile');
        }

        return this.prisma.seller.update({
            where: { id },
            data: { storeName },
        });
    }

    async remove(id: number, requestingUserId: number) {
        const seller = await this.findOne(id);

        if (seller.userId !== requestingUserId) {
            throw new ForbiddenException('You can only delete your own seller profile');
        }

        return this.prisma.seller.delete({
            where: { id },
        });
    }
}