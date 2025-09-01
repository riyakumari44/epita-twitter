import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RetweetsService } from './retweets.service';
import { CreateRetweetDto } from './dto/create-retweet.dto';
import { RetweetResponseDto, RetweetWithUserInfoDto, RetweetCountDto } from './dto/retweet-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('retweets')
@UseGuards(JwtAuthGuard)
export class RetweetsController {
    constructor(private readonly retweetsService: RetweetsService) { }

    @Post()
    async createRetweet(
        @Body() createRetweetDto: CreateRetweetDto,
        @Request() req
    ): Promise<RetweetResponseDto> {
        return this.retweetsService.createRetweet(createRetweetDto, req.user.id);
    }

    @Get('tweets/:tweetId')
    async getRetweetsForTweet(
        @Param('tweetId') tweetId: string
    ): Promise<RetweetWithUserInfoDto[]> {
        return this.retweetsService.getRetweetsForTweet(tweetId);
    }

    @Get('count/:tweetId')
    async getRetweetCount(
        @Param('tweetId') tweetId: string
    ): Promise<RetweetCountDto> {
        return this.retweetsService.getRetweetCount(tweetId);
    }

    @Delete(':retweetId')
    async deleteRetweet(
        @Param('retweetId') retweetId: string,
        @Request() req
    ): Promise<{ message: string }> {
        await this.retweetsService.deleteRetweet(retweetId, req.user.id);
        return { message: 'Retweet deleted successfully' };
    }

    @Get('user/:userId')
    async getUserRetweets(
        @Param('userId') userId: string
    ): Promise<RetweetWithUserInfoDto[]> {
        return this.retweetsService.getUserRetweets(userId);
    }
} 