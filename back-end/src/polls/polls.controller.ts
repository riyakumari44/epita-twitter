import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { PollResponseDto, PollWithVotersDto } from './dto/poll-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
    constructor(private readonly pollsService: PollsService) {}

    @Post()
    async createPoll(
        @Body() createPollDto: CreatePollDto,
        @Request() req
    ): Promise<PollResponseDto> {
        return this.pollsService.createPoll(createPollDto, req.user.id);
    }

    @Post(':pollId/vote')
    async voteOnPoll(
        @Param('pollId') pollId: string,
        @Body() votePollDto: VotePollDto,
        @Request() req
    ): Promise<{ message: string }> {
        return this.pollsService.voteOnPoll(pollId, votePollDto, req.user.id);
    }

    @Get(':pollId')
    async getPoll(
        @Param('pollId') pollId: string,
        @Request() req
    ): Promise<PollResponseDto> {
        return this.pollsService.getPollById(pollId, req.user.id);
    }

    @Get(':pollId/voters')
    async getPollWithVoters(
        @Param('pollId') pollId: string
    ): Promise<PollWithVotersDto> {
        return this.pollsService.getPollWithVoters(pollId);
    }

    @Get('tweet/:tweetId')
    async getPollsByTweet(
        @Param('tweetId') tweetId: string,
        @Request() req
    ): Promise<PollResponseDto[]> {
        return this.pollsService.getPollsByTweet(tweetId, req.user.id);
    }
} 