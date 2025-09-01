import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
    constructor(private readonly followsService: FollowsService) { }

    @Post(':userId')
    async followUser(@Request() req, @Param('userId') followingId: string) {
        return this.followsService.followUser(req.user.id, followingId);
    }

    @Delete(':userId')
    async unfollowUser(@Request() req, @Param('userId') followingId: string) {
        return this.followsService.unfollowUser(req.user.id, followingId);
    }

    @Get('followers/count/:userId')
    async getFollowersCount(@Param('userId') userId: string) {
        return this.followsService.getFollowersCount(userId);
    }

    @Get('following/count/:userId')
    async getFollowingCount(@Param('userId') userId: string) {
        return this.followsService.getFollowingCount(userId);
    }

    @Get('followers/:userId')
    async getFollowers(@Param('userId') userId: string) {
        return this.followsService.getFollowers(userId);
    }

    @Get('following/:userId')
    async getFollowing(@Param('userId') userId: string) {
        return this.followsService.getFollowing(userId);
    }

    @Get('followers/usernames/:userId')
    async getFollowersUsernames(@Param('userId') userId: string) {
        return this.followsService.getFollowersUsernames(userId);
    }
}
