import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { metadata } from 'reflect-metadata/no-conflict';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    constructor (private readonly prisma: PrismaService) {}
    
    async createCheckoutSession(buyerId: number, items: { productId: number, quantity: number }[]) {
        const lineItems: { name: string; amount: number; currency: string; quantity: number }[] = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new NotFoundException(`Product ${item.productId} not found`);
            }

            const price = Number(product.price);
            totalAmount += price * item.quantity;

            lineItems.push({
                name: product.name,
                amount: Math.round(price * 100),
                currency: 'PHP',
                quantity: item.quantity,
            });
        }
        
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64'),
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: lineItems,
                        payment_method_types: ['card', 'gcash'],
                        success_url: `${process.env.FRONTEND_URL}/checkout-success`,
                        cancel_url: `${process.env.FRONTEND_URL}/cart`,
                        description: `Order for buyer ${buyerId}`,
                        metadata: {
                            buyerId: buyerId.toString(),
                            items: JSON.stringify(items),
                        },
                    },
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session');
        }

        return { checkoutUrl: data.data.attributes.checkout_url };        
    }

    verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
        const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;

        const parts = signatureHeader.split(',');
        const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1];
        const testSig = parts.find((p) => p.startsWith('te='))?.split('=')[1];
        const liveSig = parts.find((p) => p.startsWith('li='))?.split('=')[1];
        const signature = testSig || liveSig;

        if (!timestamp || !signature) return false;

        const payload = `${timestamp}.${rawBody}`;
        const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

        return expectedSignature === signature;
    }

    async handlePaymentSuccess(buyerId: number, items: { productId: number; quantity: number}[]) {
        const orderItemsData: {
            productId: number;
            sellerId: number;
            quantity: number;
            priceAtPurchase: number;
            commissionAmount: number;
        }[] = [];

        let totalAmount = 0;
        const COMMISSION_RATE = 0.1;

        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) continue;

            const price = Number(product.price);
            const lineTotal = price * item.quantity;
            const commission = lineTotal * COMMISSION_RATE;

            totalAmount += lineTotal;

            orderItemsData.push({
                productId: product.id,
                sellerId: product.sellerId,
                quantity: item.quantity,
                priceAtPurchase: price,
                commissionAmount: commission,
            });
        }    

        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    buyerId,
                    totalAmount,
                    status: 'pending',
                },
            });

            for (const itemData of orderItemsData) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        ...itemData,
                        status: 'pending',
                        createdAt: new Date(),
                    },
                });
            }

            return order;
        });
    }
}
