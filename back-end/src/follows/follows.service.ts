import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
    constructor(
        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
        private usersService: UsersService,
        private notificationsService: NotificationsService,
    ) { }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new ConflictException('Users cannot follow themselves');
        }

        const follower = await this.usersService.findOne(followerId);
        const following = await this.usersService.findOne(followingId);

        const existingFollow = await this.followRepository.findOne({
            where: {
                follower: { id: followerId },
                following: { id: followingId }
            },
            relations: ['follower', 'following']
        });

        if (existingFollow) {
            throw new ConflictException('Already following this user');
        }

        const follow = this.followRepository.create({
            follower,
            following
        });

        await this.followRepository.save(follow);

        // Update follower counts
        following.followersCount = (following.followersCount || 0) + 1;
        follower.followingCount = (follower.followingCount || 0) + 1;

        await this.usersService.update(followingId, { followersCount: following.followersCount });
        await this.usersService.update(followerId, { followingCount: follower.followingCount });

        // Create notification
        await this.notificationsService.createFollowNotification(followerId, followingId);

        return { message: 'Successfully followed user' };
    }

    async unfollowUser(followerId: string, followingId: string) {
        const follow = await this.followRepository.findOne({
            where: {
                follower: { id: followerId },
                following: { id: followingId }
            },
            relations: ['follower', 'following']
        });

        if (!follow) {
            throw new NotFoundException('Follow relationship not found');
        }

        await this.followRepository.remove(follow);

        // Update follower counts
        const following = await this.usersService.findOne(followingId);
        const follower = await this.usersService.findOne(followerId);

        following.followersCount = Math.max(0, (following.followersCount || 0) - 1);
        follower.followingCount = Math.max(0, (follower.followingCount || 0) - 1);

        await this.usersService.update(followingId, { followersCount: following.followersCount });
        await this.usersService.update(followerId, { followingCount: follower.followingCount });

        return { message: 'Successfully unfollowed user' };
    }

    async getFollowersCount(userId: string): Promise<{ followersCount: number }> {
        const count = await this.followRepository.count({
            where: { following: { id: userId } }
        });

        return { followersCount: count };
    }

    async getFollowingCount(userId: string): Promise<{ followingCount: number }> {
        const count = await this.followRepository.count({
            where: { follower: { id: userId } }
        });

        return { followingCount: count };
    }

    async getFollowers(userId: string) {
        const followers = await this.followRepository.find({
            where: { following: { id: userId } },
            relations: ['follower']
        });

        return followers.map(follow => ({
            id: follow.follower.id,
            username: follow.follower.username,
            profileImageUrl: follow.follower.profileImageUrl,
            displayName: follow.follower.displayName,
        }));
    }

    async getFollowing(userId: string) {
        const following = await this.followRepository.find({
            where: { follower: { id: userId } },
            relations: ['following']
        });

        return following.map(follow => ({
            id: follow.following.id,
            username: follow.following.username,
            profileImageUrl: follow.following.profileImageUrl,
            displayName: follow.following.displayName,
        }));
    }

    async getFollowersUsernames(userId: string): Promise<string[]> {
        const followers = await this.followRepository.find({
            where: { following: { id: userId } },
            relations: ['follower']
        });

        return followers.map(follow => follow.follower.username);
    }
}
