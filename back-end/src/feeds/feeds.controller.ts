import { Controller, Get, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedResponseDto } from './dto/feed-response.dto';

@Controller('feeds')
@UseGuards(JwtAuthGuard)
export class FeedsController {
    constructor(private readonly feedsService: FeedsService) { }

    @Get()
    async getUserFeed(
        @Request() req,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    ): Promise<FeedResponseDto> {
        const result = await this.feedsService.getUserFeed(req.user.id, page, limit);

        return {
            success: true,
            data: result.tweets,
            message: `Retrieved ${result.tweets.length} feed tweets`,
            total: result.total,
        };
    }

    @Get('for-you')
    async getForYouFeed(
        @Request() req,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    ): Promise<FeedResponseDto> {
        const result = await this.feedsService.getForYouFeed(req.user.id, page, limit);

        return {
            success: true,
            data: result.tweets,
            message: `Retrieved ${result.tweets.length} for you tweets`,
            total: result.total,
        };
    }
}
