import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    HttpStatus,
    HttpCode,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { TweetMapper } from './mappers/tweet.mapper';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TweetListResponseDto, SingleTweetResponseDto } from './dto/tweet-response.dto';

@Controller('/tweets')
export class TweetsController {
    constructor(private readonly tweetsService: TweetsService) { }

    // Create Tweet API (POST /tweets)
    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('media'))
    @HttpCode(HttpStatus.CREATED)
    async createTweet(
        @Request() req,
        @Body() createTweetDto: CreateTweetDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp|mp4|avi|mov|wmv)$/ }),
                ],
                fileIsRequired: false,
            })
        )
        mediaFile?: Express.Multer.File,
    ): Promise<SingleTweetResponseDto> {
        const tweet = await this.tweetsService.createTweet(
            req.user.id,
            createTweetDto,
            mediaFile
        );

        const tweetWithUser = await this.tweetsService.getTweetById(tweet.id);

        return {
            success: true,
            data: TweetMapper.toResponseDto(tweetWithUser),
            message: 'Tweet created successfully',
        };
    }

    // Get Tweets by User API (GET /tweets/user/:userId)
    @Get('user/:userId')
    async getTweetsByUser(
        @Param('userId') userId: string,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    ): Promise<TweetListResponseDto> {
        const result = await this.tweetsService.getTweetsByUserWithPagination(userId, page, limit);

        return {
            success: true,
            data: TweetMapper.toResponseDtoList(result.tweets),
            message: `Retrieved ${result.tweets.length} tweets for user`,
            total: result.total,
        };
    }

    // Get Single Tweet by ID API (GET /tweets/:tweetId)
    @Get(':tweetId')
    async getTweetById(@Param('tweetId') tweetId: string): Promise<SingleTweetResponseDto> {
        const tweet = await this.tweetsService.getTweetById(tweetId);

        return {
            success: true,
            data: TweetMapper.toResponseDto(tweet),
            message: 'Tweet retrieved successfully',
        };
    }

    // Update Tweet API (PUT /tweets/:tweetId)
    @Put(':tweetId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateTweet(
        @Param('tweetId') tweetId: string,
        @Request() req,
        @Body() updateTweetDto: UpdateTweetDto,
    ): Promise<SingleTweetResponseDto> {
        const tweet = await this.tweetsService.updateTweet(tweetId, req.user.id, updateTweetDto);

        return {
            success: true,
            data: TweetMapper.toResponseDto(tweet),
            message: 'Tweet updated successfully',
        };
    }

    // Delete Tweet API (DELETE /tweets/:tweetId)
    @Delete(':tweetId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteTweet(
        @Param('tweetId') tweetId: string,
        @Request() req,
    ): Promise<{ success: boolean; message: string }> {
        await this.tweetsService.deleteTweet(tweetId, req.user.id);

        return {
            success: true,
            message: 'Tweet deleted successfully',
        };
    }

    // Get All Tweets API (GET /tweets)
    @Get()
    async getAllTweets(): Promise<TweetListResponseDto> {
        const tweets = await this.tweetsService.getAllTweets();

        return {
            success: true,
            data: TweetMapper.toResponseDtoList(tweets),
            message: `Retrieved ${tweets.length} tweets`,
            total: tweets.length,
        };
    }

    // Get My Tweets API (GET /tweets/me)
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMyTweets(
        @Request() req,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    ): Promise<TweetListResponseDto> {
        const result = await this.tweetsService.getTweetsByUserWithPagination(req.user.id, page, limit);

        return {
            success: true,
            data: TweetMapper.toResponseDtoList(result.tweets),
            message: `Retrieved ${result.tweets.length} of your tweets`,
            total: result.total,
        };
    }

    // Like Tweet API (POST /tweets/:tweetId/like)
    @Post(':tweetId/like')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async likeTweet(
        @Param('tweetId') tweetId: string,
        @Request() req,
    ): Promise<{ success: boolean; message: string; likesCount: number }> {
        await this.tweetsService.incrementLikeCount(tweetId);

        const tweet = await this.tweetsService.getTweetById(tweetId);
        return {
            success: true,
            message: 'Tweet liked successfully',
            likesCount: tweet.likesCount,
        };
    }

    // Unlike Tweet API (DELETE /tweets/:tweetId/like)
    @Delete(':tweetId/like')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async unlikeTweet(
        @Param('tweetId') tweetId: string,
        @Request() req,
    ): Promise<{ success: boolean; message: string; likesCount: number }> {
        await this.tweetsService.decrementLikeCount(tweetId);

        const tweet = await this.tweetsService.getTweetById(tweetId);
        return {
            success: true,
            message: 'Tweet unliked successfully',
            likesCount: tweet.likesCount,
        };
    }

    // Get Like Count API (GET /tweets/:tweetId/likes)
    @Get(':tweetId/likes')
    async getLikeCount(@Param('tweetId') tweetId: string): Promise<{ count: number }> {
        const tweet = await this.tweetsService.getTweetById(tweetId);
        return {
            count: tweet.likesCount || 0,
        };
    }
} 