import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retweet } from './entities/retweet.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateRetweetDto } from './dto/create-retweet.dto';
import { RetweetResponseDto, RetweetWithUserInfoDto, RetweetCountDto } from './dto/retweet-response.dto';

@Injectable()
export class RetweetsService {
    constructor(
        @InjectRepository(Retweet)
        private retweetsRepository: Repository<Retweet>,
        @InjectRepository(Tweet)
        private tweetsRepository: Repository<Tweet>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async createRetweet(createRetweetDto: CreateRetweetDto, userId: string): Promise<RetweetResponseDto> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: createRetweetDto.tweet_id }
        });

        if (!tweet) {
            throw new NotFoundException('Tweet not found');
        }

        // Validate that the user exists
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user already retweeted this tweet (only if no comment)
        if (!createRetweetDto.comment) {
            const existingRetweet = await this.retweetsRepository
                .createQueryBuilder('retweet')
                .where('retweet.tweet_id = :tweetId', { tweetId: createRetweetDto.tweet_id })
                .andWhere('retweet.user_id = :userId', { userId })
                .andWhere('retweet.comment IS NULL')
                .getOne();

            if (existingRetweet) {
                throw new ConflictException('You have already retweeted this tweet');
            }
        }

        // Create the retweet
        const retweet = this.retweetsRepository.create({
            tweet_id: createRetweetDto.tweet_id,
            user_id: userId,
            comment: createRetweetDto.comment || null,
        });

        const savedRetweet = await this.retweetsRepository.save(retweet);

        // Update tweet retweet count
        await this.tweetsRepository.increment({ id: createRetweetDto.tweet_id }, 'retweetsCount', 1);

        return {
            id: savedRetweet.id,
            tweet_id: savedRetweet.tweet_id,
            user_id: savedRetweet.user_id,
            comment: savedRetweet.comment,
            created_at: savedRetweet.created_at,
        };
    }

    async getRetweetsForTweet(tweetId: string): Promise<RetweetWithUserInfoDto[]> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: tweetId }
        });

        if (!tweet) {
            throw new NotFoundException('Tweet not found');
        }

        // Get retweets with user information, ordered by newest first
        const retweets = await this.retweetsRepository
            .createQueryBuilder('retweet')
            .leftJoinAndSelect('retweet.user', 'user')
            .where('retweet.tweet_id = :tweetId', { tweetId })
            .orderBy('retweet.created_at', 'DESC')
            .getMany();

        // Transform the results to match our DTO structure
        return retweets.map(retweet => ({
            id: retweet.id,
            tweet_id: retweet.tweet_id,
            user_id: retweet.user_id,
            comment: retweet.comment,
            created_at: retweet.created_at,
            user: {
                username: retweet.user.username,
                profileImageUrl: retweet.user.profileImageUrl,
            },
        }));
    }

    async getRetweetCount(tweetId: string): Promise<RetweetCountDto> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: tweetId }
        });

        if (!tweet) {
            throw new NotFoundException('Tweet not found');
        }

        // Get retweet count
        const retweetCount = await this.retweetsRepository.count({
            where: { tweet_id: tweetId }
        });

        return {
            tweet_id: tweetId,
            retweet_count: retweetCount,
        };
    }

    async deleteRetweet(retweetId: string, userId: string): Promise<void> {
        // Find the retweet
        const retweet = await this.retweetsRepository.findOne({
            where: { id: retweetId }
        });

        if (!retweet) {
            throw new NotFoundException('Retweet not found');
        }

        // Check if the user owns this retweet
        if (retweet.user_id !== userId) {
            throw new BadRequestException('You can only delete your own retweets');
        }

        // Delete the retweet
        await this.retweetsRepository.remove(retweet);

        // Update tweet retweet count
        await this.tweetsRepository.increment({ id: retweet.tweet_id }, 'retweetsCount', -1);
    }

    async getUserRetweets(userId: string): Promise<RetweetWithUserInfoDto[]> {
        // Get all retweets by a specific user
        const retweets = await this.retweetsRepository
            .createQueryBuilder('retweet')
            .leftJoinAndSelect('retweet.user', 'user')
            .where('retweet.user_id = :userId', { userId })
            .orderBy('retweet.created_at', 'DESC')
            .getMany();

        return retweets.map(retweet => ({
            id: retweet.id,
            tweet_id: retweet.tweet_id,
            user_id: retweet.user_id,
            comment: retweet.comment,
            created_at: retweet.created_at,
            user: {
                username: retweet.user.username,
                profileImageUrl: retweet.user.profileImageUrl,
            },
        }));
    }
} 