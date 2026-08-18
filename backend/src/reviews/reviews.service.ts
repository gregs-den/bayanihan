import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(data: {
    productId: number;
    buyerId: number;
    rating: number;
    comment?: string;
  }) {

    const product = await this.prismaService.product.findUnique({
        where: { id: data.productId },
    });

    if (!product) {
        throw new NotFoundException('Product not found');
    }

    return this.prismaService.review.create({
        data: {
            productId: data.productId,
            buyerId: data.buyerId,
            rating: data.rating,
            comment: data.comment,
        },
    });
  }

  async findAll() {
    return this.prismaService.review.findMany();
  }

  async findOne(id: number) {
    const review = await this.prismaService.review.findUnique({
        where: { id },
    });

    if (!review) {
        throw new NotFoundException('Review not found');
    }

    return review;
  }

  async remove(id: number, requestingUserId: number) {
    const review = await this.findOne(id);

    if (review.buyerId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }    

    return this.prismaService.review.delete({
        where: { id },
    });
  }
}
