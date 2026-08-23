import { Controller, Post, Body, UseGuards, Req, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(AuthGuard)
    @Post('checkout')
    createCheckout(@Body() body: CreateCheckoutDto, @Req() request: any) {
        return this.paymentsService.createCheckoutSession(request.userId, body.items);
    }

    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Req() request: any, @Headers('paymongo-signature') signature: string) {
        const rawBody = request.rawBody.toString();

        const isValid = this.paymentsService.verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            return { received: false };
        }

        const event = JSON.parse(rawBody);

        if (event.data.attributes.type === 'checkout_session.payment.paid') {
            const metadata = event.data.attributes.data.attributes.metadata;
            const buyerId = Number(metadata.buyerId);
            const items = JSON.parse(metadata.items);

            await this.paymentsService.handlePaymentSuccess(buyerId, items);
        }

        return { received: true };
    }
}
