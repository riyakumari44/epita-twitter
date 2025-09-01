import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './entities/poll.entity';
import { PollOption } from './entities/poll-option.entity';
import { PollVote } from './entities/poll-vote.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { PollResponseDto, PollWithVotersDto } from './dto/poll-response.dto';

@Injectable()
export class PollsService {
    constructor(
        @InjectRepository(Poll)
        private pollsRepository: Repository<Poll>,
        @InjectRepository(PollOption)
        private pollOptionsRepository: Repository<PollOption>,
        @InjectRepository(PollVote)
        private pollVotesRepository: Repository<PollVote>,
        @InjectRepository(Tweet)
        private tweetsRepository: Repository<Tweet>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async createPoll(createPollDto: CreatePollDto, userId: string): Promise<PollResponseDto> {
        // Validate that the tweet exists
        const tweet = await this.tweetsRepository.findOne({
            where: { id: createPollDto.tweet_id }
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

        // Check if poll already exists for this tweet
        const existingPoll = await this.pollsRepository.findOne({
            where: { tweet_id: createPollDto.tweet_id }
        });

        if (existingPoll) {
            throw new ConflictException('A poll already exists for this tweet');
        }

        // Create the poll
        const poll = this.pollsRepository.create({
            tweet_id: createPollDto.tweet_id,
            user_id: userId,
            expires_at: createPollDto.expires_at ? new Date(createPollDto.expires_at) : null,
        });

        const savedPoll = await this.pollsRepository.save(poll);

        // Create poll options
        const pollOptions = createPollDto.options.map(optionText =>
            this.pollOptionsRepository.create({
                poll_id: savedPoll.id,
                option_text: optionText,
            })
        );

        await this.pollOptionsRepository.save(pollOptions);

        // Return the created poll with options
        return this.getPollById(savedPoll.id, userId);
    }

    async voteOnPoll(pollId: string, votePollDto: VotePollDto, userId: string): Promise<{ message: string }> {
        // Validate that the poll exists
        const poll = await this.pollsRepository.findOne({
            where: { id: pollId }
        });

        if (!poll) {
            throw new NotFoundException('Poll not found');
        }

        // Check if poll is expired
        if (poll.expires_at && new Date() > poll.expires_at) {
            throw new BadRequestException('This poll has expired');
        }

        // Validate that the option exists and belongs to this poll
        const option = await this.pollOptionsRepository.findOne({
            where: { id: votePollDto.option_id, poll_id: pollId }
        });

        if (!option) {
            throw new NotFoundException('Invalid option for this poll');
        }

        // Check if user already voted on this poll
        const existingVote = await this.pollVotesRepository.findOne({
            where: { poll_id: pollId, user_id: userId }
        });

        if (existingVote) {
            throw new ConflictException('You have already voted on this poll');
        }

        // Create the vote
        const vote = this.pollVotesRepository.create({
            poll_id: pollId,
            option_id: votePollDto.option_id,
            user_id: userId,
        });

        await this.pollVotesRepository.save(vote);

        return { message: 'Vote recorded successfully' };
    }

    async getPollById(pollId: string, userId?: string): Promise<PollResponseDto> {
        // Get poll with options
        const poll = await this.pollsRepository.findOne({
            where: { id: pollId },
            relations: ['options']
        });

        if (!poll) {
            throw new NotFoundException('Poll not found');
        }

        // Get vote counts for each option
        const optionsWithVotes = await Promise.all(
            poll.options.map(async (option) => {
                const voteCount = await this.pollVotesRepository.count({
                    where: { option_id: option.id }
                });
                return { ...option, vote_count: voteCount };
            })
        );

        // Calculate total votes and percentages
        const totalVotes = optionsWithVotes.reduce((sum, option) => sum + option.vote_count, 0);
        const optionsWithPercentages = optionsWithVotes.map(option => ({
            id: option.id,
            option_text: option.option_text,
            vote_count: option.vote_count,
            percentage: totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0,
        }));

        // Check if user has voted
        let userVoted = false;
        let userVoteOptionId: string | undefined;
        if (userId) {
            const userVote = await this.pollVotesRepository.findOne({
                where: { poll_id: pollId, user_id: userId }
            });
            if (userVote) {
                userVoted = true;
                userVoteOptionId = userVote.option_id;
            }
        }

        // Check if poll is expired
        const isExpired = poll.expires_at ? new Date() > poll.expires_at : false;

        return {
            id: poll.id,
            tweet_id: poll.tweet_id,
            user_id: poll.user_id,
            created_at: poll.created_at,
            expires_at: poll.expires_at,
            options: optionsWithPercentages,
            total_votes: totalVotes,
            is_expired: isExpired,
            user_voted: userVoted,
            user_vote_option_id: userVoteOptionId,
        };
    }

    async getPollWithVoters(pollId: string): Promise<PollWithVotersDto> {
        // Get poll with options
        const poll = await this.pollsRepository.findOne({
            where: { id: pollId },
            relations: ['options']
        });

        if (!poll) {
            throw new NotFoundException('Poll not found');
        }

        // Get detailed vote information for each option
        const optionsWithVoters = await Promise.all(
            poll.options.map(async (option) => {
                const votes = await this.pollVotesRepository.find({
                    where: { option_id: option.id },
                    relations: ['voter']
                });

                const voteCount = votes.length;
                const voters = votes.map(vote => ({
                    user_id: vote.voter.id,
                    username: vote.voter.username,
                    profileImageUrl: vote.voter.profileImageUrl,
                }));

                return {
                    id: option.id,
                    option_text: option.option_text,
                    vote_count: voteCount,
                    percentage: 0, // Will be calculated below
                    voters,
                };
            })
        );

        // Calculate total votes and percentages
        const totalVotes = optionsWithVoters.reduce((sum, option) => sum + option.vote_count, 0);
        optionsWithVoters.forEach(option => {
            option.percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
        });

        // Check if poll is expired
        const isExpired = poll.expires_at ? new Date() > poll.expires_at : false;

        return {
            id: poll.id,
            tweet_id: poll.tweet_id,
            user_id: poll.user_id,
            created_at: poll.created_at,
            expires_at: poll.expires_at,
            options: optionsWithVoters,
            total_votes: totalVotes,
            is_expired: isExpired,
        };
    }

    async getPollsByTweet(tweetId: string, userId?: string): Promise<PollResponseDto[]> {
        const polls = await this.pollsRepository.find({
            where: { tweet_id: tweetId },
            relations: ['options']
        });

        return Promise.all(polls.map(poll => this.getPollById(poll.id, userId)));
    }
} 