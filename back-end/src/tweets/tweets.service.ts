import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet, TweetType } from './entities/tweet.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { TweetMapper } from './mappers/tweet.mapper';
import { CloudinaryMediaService } from './services/cloudinary-media.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TweetsService {
    constructor(
        @InjectRepository(Tweet)
        private readonly tweetRepository: Repository<Tweet>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly cloudinaryMediaService: CloudinaryMediaService,
    ) { }

    async createTweet(
        userId: string,
        createTweetDto: CreateTweetDto,
        mediaFile?: Express.Multer.File
    ): Promise<Tweet> {
        // Validate that either content or media is provided
        const hasContent = createTweetDto.content && createTweetDto.content.trim().length > 0;
        const hasMedia = !!mediaFile;

        if (!hasContent && !hasMedia) {
            throw new BadRequestException('Tweet must contain either text content or media');
        }

        // Determine tweet type based on content and media
        let tweetType: TweetType;
        if (hasContent && hasMedia) {
            tweetType = TweetType.MIXED;
        } else if (hasMedia) {
            tweetType = TweetType.MEDIA;
        } else {
            tweetType = TweetType.TEXT;
        }

        // Create tweet first
        const tweet = this.tweetRepository.create({
            content: hasContent ? createTweetDto.content!.trim() : '',
            userId,
            type: tweetType,
        });

        // Save tweet to get the ID
        const savedTweet = await this.tweetRepository.save(tweet);

        // Handle media upload if provided
        if (mediaFile) {
            try {
                const mediaResult = await this.cloudinaryMediaService.uploadMedia(
                    mediaFile,
                    userId,
                    savedTweet.id
                );

                // Update tweet with media information
                savedTweet.mediaUrl = mediaResult.url;
                savedTweet.mediaType = mediaResult.type;
                // Note: type is already set above, no need to change it

                await this.tweetRepository.save(savedTweet);
            } catch (error) {
                // If media upload fails, delete the tweet
                await this.tweetRepository.remove(savedTweet);
                throw error;
            }
        }

        return savedTweet;
    }

    async getTweetsByUser(userId: string): Promise<Tweet[]> {
        const tweets = await this.tweetRepository.find({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        if (!tweets.length) {
            return [];
        }

        return tweets;
    }

    async getTweetById(tweetId: string): Promise<Tweet> {
        const tweet = await this.tweetRepository.findOne({
            where: { id: tweetId },
            relations: ['user'],
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID "${tweetId}" not found`);
        }

        return tweet;
    }

    async updateTweet(tweetId: string, userId: string, updateTweetDto: UpdateTweetDto): Promise<Tweet> {
        const tweet = await this.getTweetById(tweetId);

        // Check if user owns the tweet
        if (tweet.userId !== userId) {
            throw new UnauthorizedException('You can only edit your own tweets');
        }

        // Update tweet
        Object.assign(tweet, updateTweetDto);
        return await this.tweetRepository.save(tweet);
    }

    async deleteTweet(tweetId: string, userId: string): Promise<void> {
        const tweet = await this.getTweetById(tweetId);

        // Check if user owns the tweet
        if (tweet.userId !== userId) {
            throw new UnauthorizedException('You can only delete your own tweets');
        }

        // Delete media from Cloudinary if present
        if (tweet.mediaUrl) {
            await this.cloudinaryMediaService.deleteMedia(tweet.mediaUrl);
        }

        // Delete tweet from database
        await this.tweetRepository.remove(tweet);
    }

    async getAllTweets(): Promise<Tweet[]> {
        return await this.tweetRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getTweetsByUserWithPagination(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ tweets: Tweet[]; total: number; page: number; totalPages: number }> {
        const [tweets, total] = await this.tweetRepository.findAndCount({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            tweets,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async incrementLikeCount(tweetId: string): Promise<void> {
        await this.tweetRepository.increment({ id: tweetId }, 'likesCount', 1);
    }

    async decrementLikeCount(tweetId: string): Promise<void> {
        await this.tweetRepository.decrement({ id: tweetId }, 'likesCount', 1);
    }

    async incrementRetweetCount(tweetId: string): Promise<void> {
        await this.tweetRepository.increment({ id: tweetId }, 'retweetsCount', 1);
    }

    async decrementRetweetCount(tweetId: string): Promise<void> {
        await this.tweetRepository.decrement({ id: tweetId }, 'retweetsCount', 1);
    }
} 