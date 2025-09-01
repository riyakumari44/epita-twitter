import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Follow } from '../follows/entities/follow.entity';
import { TweetMapper } from '../tweets/mappers/tweet.mapper';
import { TweetResponseDto } from '../tweets/dto/tweet-response.dto';

@Injectable()
export class FeedsService {
    constructor(
        @InjectRepository(Tweet)
        private readonly tweetRepository: Repository<Tweet>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
    ) { }

    async getUserFeed(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<{ tweets: TweetResponseDto[]; total: number }> {
        try {
            // Find all users that the current user follows
            const following = await this.followRepository.find({
                where: { follower: { id: userId } },
                relations: ['following'],
            });

            // Extract the IDs of users being followed
            const followingIds = following.map(f => f.following.id);

            // Add the user's own ID to include their tweets in the feed
            followingIds.push(userId);

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Query tweets from followed users, with only existing relations
            const [tweets, total] = await this.tweetRepository.findAndCount({
                where: { user: { id: In(followingIds) } },
                relations: ['user'], // Remove relations that don't exist
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });

            return {
                tweets: TweetMapper.toResponseDtoList(tweets),
                total
            };
        } catch (error) {
            console.error('Error getting user feed:', error);
            throw error;
        }
    }

    async getForYouFeed(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<{ tweets: TweetResponseDto[]; total: number }> {
        try {
            // Calculate pagination
            const skip = (page - 1) * limit;

            // Query ALL tweets from all users, ordered by most recent
            const [tweets, total] = await this.tweetRepository.findAndCount({
                relations: ['user'], // Include user information
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });

            return {
                tweets: TweetMapper.toResponseDtoList(tweets),
                total
            };
        } catch (error) {
            console.error('Error getting for you feed:', error);
            throw error;
        }
    }
}
