import { Controller, Post, Body, Get, Delete,Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(body);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(Number(id));
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: any) {
    return this.reviewsService.remove(Number(id), request.userId);
  }

  @UseGuards(AdminGuard)
  @Delete('admin/:id')
  adminRemove(@Param('id') id:string) {
    return this.reviewsService.adminRemove(Number(id));
  }

}
