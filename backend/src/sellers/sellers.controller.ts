import { Controller, Get, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('sellers')
export class SellersController {
    constructor(private readonly sellersService: SellersService) {}

    @Post()
    createSeller(@Body() body: CreateSellerDto) {
        return this.sellersService.createSeller(body.userId, body.storeName);
    }

    @Get()
    findAll() {
        return this.sellersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sellersService.findOne(Number(id));
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { storeName: string }, @Req() request: any) {
        return this.sellersService.update(Number(id), body.storeName, request.userId);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() request: any) {
        return this.sellersService.remove(Number(id), request.userId);
    }
}
