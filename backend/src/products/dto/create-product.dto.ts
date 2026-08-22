import { IsInt, IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsAlpha, IsArray } from 'class-validator';

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

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: string[];

    @IsInt()
    @IsPositive()
    stock!: number;
}
