import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
        register (@Body() body: RegisterDto) {
        return this.usersService.register(body.email, body.password);
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.usersService.login(body.email, body.password);
    }

    @UseGuards(AdminGuard)
    @Get('admin/all')
    findAllAdmin() {
        return this.usersService.findAllAdmin();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(Number(id));
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() request: any) {
        return this.usersService.remove(Number(id), request.userId);
    }    
}
