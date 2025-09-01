import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReplyResponseDto, ReplyWithUserInfoDto } from './dto/reply-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('replies')
@UseGuards(JwtAuthGuard)
export class RepliesController {
    constructor(private readonly repliesService: RepliesService) { }

    @Post()
    async createReply(
        @Body() createReplyDto: CreateReplyDto,
        @Request() req
    ): Promise<ReplyResponseDto> {
        return this.repliesService.createReply(createReplyDto, req.user.id);
    }

    @Get('tweets/:tweetId/replies')
    async getRepliesForTweet(
        @Param('tweetId') tweetId: string
    ): Promise<ReplyWithUserInfoDto[]> {
        return this.repliesService.getRepliesForTweet(tweetId);
    }
} 