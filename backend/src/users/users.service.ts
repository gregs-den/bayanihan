import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = await this.jwtService.signAsync({ userId: user.id, isAdmin: user.isAdmin });

        return { message: 'Login successful', accessToken: token };
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                isAdmin: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async remove(id: number, requestingUserId: number) {
        if (id !== requestingUserId) {
            throw new ForbiddenException('You can only delete you own account');
        }
        
        await this.findOne(id); // Check if user exists before deletion

        return this.prisma.user.delete({
            where: { id },
        });
    } 

    async adminRemove(id: number) {
        const user = await this.findOne(id);

        if (user.isAdmin) {
            const adminCount = await this.prisma.user.count({
                where: { isAdmin: true },
            });

            if (adminCount <= 1 ){
                throw new BadRequestException('Cannot delete the last admin account.');
            }
        }

        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error: any) {
            if (error.code === 'P2003') {
                throw new BadRequestException(
                    'Cannot delete this user: they have a seller profile with existing products or orders. Delete their seller account first.',
                );
            }
            throw error;
        }
    }
    
    async register(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });
    }

    async findAllAdmin() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                isAdmin: true,
                createdAt: true,
            },
        });
    }

    async toggleAdmin(id: number, isAdmin: boolean) {
        const user = await this.findOne(id);

        if (!isAdmin) {
            const adminCount = await this.prisma.user.count({
                where: { isAdmin: true },
            });

            if (adminCount <= 1) {
                throw new BadRequestException('Cannot remove the last admin account.');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: { isAdmin },
            select: {
                id: true,
                email: true,
                isAdmin: true,
                createdAt: true,
            },
        });
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { message: 'If that email exists, a reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await this.emailService.sendPasswordReset(user.email, resetUrl);

        return { message: 'If that email exists, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return { message: 'Password reset successfully.' };
    }
}
