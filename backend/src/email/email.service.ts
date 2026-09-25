import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend = new Resend(process.env.RESEND_API_KEY);

    async sendOrderConfirmation(toEmail: string, orderId: number, totalAmount: number) {
        try {
            await this.resend.emails.send({
                from: 'Bayanihan <onboarding@resend.dev>',
                to: toEmail,
                subject: `Order Confirmation #${orderId}`,
                html: `
                    <h1>Thank you for your order!</h1>
                    <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
                    <p>Total: ₱${totalAmount.toFixed(2)}</p>
                    <p>You can track you order status in your account.</p>
                `,
            });
        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
        }
    }

    async sendStatusUpdate(toEmail: string, orderId: number, productName: string, newStatus: string) {
        try {
            await this.resend.emails.send({
                from: 'Bayanihan <onboarding@resend.dev>',
                to: toEmail,
                subject: `Order #${orderId} Update`,
                html: `
                    <h1>Your order status has changed</h1>
                    <p>Your item <strong>${productName}</strong> from order <strong>#${orderId}</strong> is now: <strong>${newStatus}</strong></p>
                    <p>You can view full details in your account.</p>
                `,
            });
        } catch (error) {
            console.error('Failed to send status update email:', error);
        }
    }

    async sendPasswordReset(toEmail: string, resetUrl: string) {
        try {
            await this.resend.emails.send({
                from: 'Bayanihan <onboarding@resend.dev>',
                to: toEmail,
                subject: 'Reset Your Password',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>Click the link below to reset your password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    `,
            });            
        } catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }
}
