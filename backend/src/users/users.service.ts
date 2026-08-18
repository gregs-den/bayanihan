import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
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

        const token = await this.jwtService.signAsync({ userId: user.id})

        return { message: 'Login successful', accessToken: token };
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
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
}
