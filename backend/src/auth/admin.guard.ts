import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            }); 

            if (!payload.isAdmin) {
                throw new ForbiddenException('Admin access required');
            }

            request.userId = payload.userId;
            return true;
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
