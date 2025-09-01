import { Notification } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationMapper {
    static toResponseDto(notification: Notification): NotificationResponseDto {
        return {
            id: notification.id,
            type: notification.type,
            status: notification.status,
            content: notification.content,
            actor: {
                id: notification.actor.id,
                username: notification.actor.username,
                displayName: notification.actor.displayName,
                profileImageUrl: notification.actor.profileImageUrl,
            },
            relatedTweet: notification.relatedTweet ? {
                id: notification.relatedTweet.id,
                content: notification.relatedTweet.content,
            } : undefined,
            createdAt: notification.createdAt,
        };
    }

    static toResponseDtoList(notifications: Notification[]): NotificationResponseDto[] {
        return notifications.map(notification => this.toResponseDto(notification));
    }
}
