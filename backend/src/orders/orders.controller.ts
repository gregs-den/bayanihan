import { Controller, Post, Body, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { request } from 'http';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(body.buyerId, body.items);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  findMyOrders(@Req() request:any) {
    return this.ordersService.findMyOrders(request.userId);
  }

  @UseGuards(AuthGuard)
  @Get('seller/items')
  findSellerOrderItems(@Req() request: any) {
    return this.ordersService.findSellerOrderItems(request.userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: any) {
    return this.ordersService.findOne(Number(id), request.userId);
  }

  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: 'pending' | 'completed' | 'cancelled' }) {
    return this.ordersService.updateStatus(Number(id), body.status);
  }  

  @UseGuards(AuthGuard)
  @Patch('items/:itemId/status')
  updateOrderItemStatus(
    @Param('itemId') itemId: string,
    @Body() body: { status: string},
    @Req() request: any,
  ) {
    return this.ordersService.updateOrderItemStatus(Number(itemId), body.status, request.userId);
  }
} 