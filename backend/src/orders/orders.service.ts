import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

const COMMISSION_RATE = 0.1; // 10% commission rate

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    ) {}

  async createOrder(buyerId: number, items: {productId: number; quantity: number}[]) {
    // Step 1: look each product to get price + sellerId
    const orderItemsData: {
        productId: number;
        sellerId: number;
        quantity: number;
        priceAtPurchase: number;
        commissionAmount: number;
    }[] = [];

    let totalAmount = 0;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
            `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        );
      }

      const price = Number(product.price);
      const lineTotal = price * item.quantity;
      const commissionAmount = lineTotal * COMMISSION_RATE;

      totalAmount += lineTotal;

        orderItemsData.push({
            productId: item.productId,
            sellerId: product.sellerId,
            quantity: item.quantity,
            priceAtPurchase: price,
            commissionAmount: commissionAmount,
        });
    }

    const order = await this.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                buyerId,
                totalAmount,
                status: 'pending',
             },
        });
             
        for (const itemData of orderItemsData) {
            await tx.orderItem.create({
                data: {
                    orderId: newOrder.id,
                    ...itemData,
                    createdAt: new Date(),
                },
            });
            
            await tx.product.update({
                where: { id: itemData.productId },
                data: {
                    stock: { decrement: itemData.quantity },
                },
            });
        }

        return newOrder;
    });
    
    const buyer = await this.prisma.user.findUnique({
        where: { id: buyerId },
        select: { email: true },
    });

    if (buyer) {
        await this.emailService.sendOrderConfirmation(buyer.email, order.id, totalAmount);
    }

    return order;        
}

    async findOne(id: number, requestingUserId: number) {
        const order = await this.findOrderOrThrow(id);
        
        if (order.buyerId !== requestingUserId) {
            throw new ForbiddenException('You can only view your own orders');
        }

        return order;
    }

    async updateStatus(id: number, status: 'pending' | 'completed' | 'cancelled') {
        await this.findOrderOrThrow(id); // Check if order exists before updating

        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }

    private async findOrderOrThrow(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { orderItems: true},
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findMyOrders(buyerId: number) {
        return this.prisma.order.findMany({
            where: { buyerId },
            include: { orderItems: {
                include: {
                    seller: {
                        select: {
                            storeName: true,
                            isActive: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc'},
        });
    }

    async findSellerOrderItems(userId: number) {
        const seller = await this.prisma.seller.findUnique({
            where: {userId},
        });

        if (!seller) {
            throw new NotFoundException('You do not have a seller profile');
        }

        return this.prisma.orderItem.findMany({
            where: { sellerId: seller.id },
            include: {
                order: true,
                product: true,
            },
            orderBy: { createdAt: 'desc'},
        });
    }

    async updateOrderItemStatus(itemId: number, status: string, requestingUserId: number) {
        const item = await this.prisma.orderItem.findUnique({
            where: { id: itemId },
            include: { 
                seller: true,
                product: true,
                order: {
                    include: {
                        buyer: {
                            select: { email: true },
                        },
                    },
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Order item not found');
        }

        if (item.seller.userId !== requestingUserId) {
            throw new ForbiddenException('You can only update your own order items');
        }

        const updateItem = await this.prisma.orderItem.update({
            where: { id: itemId },
            data: { status },
        });

        await this.emailService.sendStatusUpdate(
            item.order.buyer.email,
            item.orderId,
            item.product.name,
            status,
        );

        return updateItem;
    }

    async findAllAdmin() {
        return this.prisma.order.findMany({
            include: {
                buyer: {
                    select: { email: true },
                },
                orderItems: {
                    include: {
                        seller: {
                            select: { storeName: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}