import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';  
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [PrismaModule, CategoriesModule, UsersModule, SellersModule, ProductsModule, OrdersModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
