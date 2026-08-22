import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async createProduct(data: {
        sellerId: number;
        categoryId: number;
        name: string;
        description?: string;
        price: number;
        imageUrls?: string[];
        stock: number;
    }) {
        const seller = await this.prisma.seller.findUnique({
            where: { id: data.sellerId },
        });

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        const category = await this.prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return this.prisma.product.create({
            data: {
                sellerId: data.sellerId,
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                price: data.price,
                imageUrls: data.imageUrls,
                stock: data.stock,
            },
        });
    }

    async findAll(search?: string, categoryId?: number, sellerId?: number) {
        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (sellerId) {
            where.sellerId = sellerId;
        }

        const products = await this.prisma.product.findMany({
            where,
            include: { reviews: true },
        });

        return products.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const averageRating =
                ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r, 0) / + ratings.length
                : null;

            const { reviews, ...rest } = product;
            return { ...rest, averageRating, reviewCount: ratings.length };
        });        
    }

    async findOne(id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: number, data: Partial<{
        name: string;
        description: string;
        price: number;
        imageUrls: string[];
        stock: number;
    }>, requestingUserId: number) {
        const product = await this.findOne(id);

        const seller = await this.prisma.seller.findUnique({
            where: { id: product.sellerId },
        });

        if (!seller || seller.userId !== requestingUserId) {
            throw new ForbiddenException('You can only update your own products');
        }

        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: number, requestingUserId: number) {
        const product = await this.findOne(id);

        const seller = await this.prisma.seller.findUnique({
            where: { id: product.sellerId },
        });

        if (!seller || seller.userId !== requestingUserId) {
            throw new ForbiddenException('You can only delete your own products');
        }
        await this.findOne(id); // Check if product exists before deletion

        return this.prisma.product.delete({
            where: { id },
        });
    }
}
