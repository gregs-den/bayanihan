import { IsInt, IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsInt()
    sellerId!: number;

    @IsInt()
    categoryId!: number;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    price!: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsInt()
    @IsPositive()
    stock!: number;
}
