import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader){
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1]; // "Bearer <token>"

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            request.userId = payload.userId; // attach to request for later use
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
 