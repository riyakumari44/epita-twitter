import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        status?: string,
    ): Promise<{ notifications: NotificationResponseDto[]; total: number; unreadCount: number }> {
        const skip = (page - 1) * limit;

        // Build query
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.actor', 'actor')
            .leftJoinAndSelect('notification.relatedTweet', 'relatedTweet')
            .where('notification.recipient.id = :userId', { userId });

        // Filter by status if provided
        if (status) {
            queryBuilder.andWhere('notification.status = :status', { status });
        }

        // Execute query with pagination
        const [notifications, total] = await queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Count unread notifications
        const unreadCount = await this.notificationRepository.count({
            where: {
                recipient: { id: userId },
                status: NotificationStatus.CREATED,
            },
        });

        return {
            notifications: NotificationMapper.toResponseDtoList(notifications),
            total,
            unreadCount,
        };
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        const notification = await this.notificationRepository.findOne({
            where: { id, recipient: { id: userId } },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.status = NotificationStatus.READ;
        await this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { recipient: { id: userId }, status: NotificationStatus.CREATED },
            { status: NotificationStatus.READ },
        );
    }

    async archiveNotification(id: string, userId: string): Promise<void> {
        const notification = await this.notificationRepository.findOne({
            where: { id, recipient: { id: userId } },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.status = NotificationStatus.ARCHIVED;
        await this.notificationRepository.save(notification);
    }

    async createFollowNotification(followerId: string, followingId: string): Promise<Notification> {
        const notification = this.notificationRepository.create({
            type: NotificationType.FOLLOW,
            content: 'started following you',
            recipient: { id: followingId },
            actor: { id: followerId },
        });

        return this.notificationRepository.save(notification);
    }

    async createLikeNotification(
        userId: string,
        tweetId: string,
        tweetAuthorId: string,
    ): Promise<Notification | null> {
        // Don't notify if liking your own tweet
        if (userId === tweetAuthorId) {
            return null;
        }

        const notification = this.notificationRepository.create({
            type: NotificationType.LIKE,
            content: 'liked your tweet',
            recipient: { id: tweetAuthorId },
            actor: { id: userId },
            relatedTweet: { id: tweetId },
        });

        return this.notificationRepository.save(notification);
    }

    async createCommentNotification(
        userId: string,
        tweetId: string,
        tweetAuthorId: string,
    ): Promise<Notification | null> {
        // Don't notify if commenting on your own tweet
        if (userId === tweetAuthorId) {
            return null;
        }

        const notification = this.notificationRepository.create({
            type: NotificationType.COMMENT,
            content: 'commented on your tweet',
            recipient: { id: tweetAuthorId },
            actor: { id: userId },
            relatedTweet: { id: tweetId },
        });

        return this.notificationRepository.save(notification);
    }
}
