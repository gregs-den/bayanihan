import { IsInt, IsArray, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsInt()
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
    @IsInt()
    buyerId!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}