import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReplyResponseDto, ReplyWithUserInfoDto } from './dto/reply-response.dto';

@Injectable()
export class RepliesService {
    constructor(
        @InjectRepository(Reply)
        private repliesRepository: Repository<Reply>,
        @InjectRepository(Tweet)
        private tweetsRepository: Repository<Tweet>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async createReply(createReplyDto: CreateReplyDto, userId: string): Promise<ReplyResponseDto> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: createReplyDto.tweet_id }
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

        // Create the reply
        const reply = this.repliesRepository.create({
            tweet_id: createReplyDto.tweet_id,
            user_id: userId,
            reply_text: createReplyDto.reply_text,
        });

        const savedReply = await this.repliesRepository.save(reply);

        // Update tweet reply count
        await this.tweetsRepository.increment({ id: createReplyDto.tweet_id }, 'repliesCount', 1);

        return {
            reply_id: savedReply.reply_id,
            timestamp: savedReply.timestamp,
        };
    }

    async getRepliesForTweet(tweetId: string): Promise<ReplyWithUserInfoDto[]> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: tweetId }
        });

        if (!tweet) {
            throw new NotFoundException('Tweet not found');
        }

        // Get replies with user information, ordered by newest first
        const replies = await this.repliesRepository
            .createQueryBuilder('reply')
            .leftJoinAndSelect('reply.user', 'user')
            .where('reply.tweet_id = :tweetId', { tweetId })
            .orderBy('reply.timestamp', 'DESC')
            .getMany();

        // Transform the results to match our DTO structure
        return replies.map(reply => ({
            reply_id: reply.reply_id,
            tweet_id: reply.tweet_id,
            user_id: reply.user_id,
            reply_text: reply.reply_text,
            timestamp: reply.timestamp,
            user: {
                username: reply.user.username,
                profileImageUrl: reply.user.profileImageUrl,
            },
        }));
    }
} 