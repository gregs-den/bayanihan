import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateSellerDto {
  @IsInt()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  storeName!: string;
}