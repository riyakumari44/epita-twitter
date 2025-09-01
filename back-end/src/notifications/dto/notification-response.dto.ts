import { NotificationType, NotificationStatus } from '../entities/notification.entity';

export class NotificationResponseDto {
    id: string;
    type: NotificationType;
    status: NotificationStatus;
    content: string;
    actor: {
        id: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
    };
    relatedTweet?: {
        id: string;
        content: string;
    };
    createdAt: Date;
}

export class NotificationListResponseDto {
    success: boolean;
    data: NotificationResponseDto[];
    message: string;
    total: number;
    unreadCount: number;
}
