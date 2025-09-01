import { Controller, Get, Patch, Param, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationListResponseDto } from './dto/notification-response.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getUserNotifications(
        @Request() req,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
        @Query('status') status?: string,
    ): Promise<NotificationListResponseDto> {
        const result = await this.notificationsService.getUserNotifications(
            req.user.id,
            page,
            limit,
            status,
        );

        return {
            success: true,
            data: result.notifications,
            message: `Retrieved ${result.notifications.length} notifications`,
            total: result.total,
            unreadCount: result.unreadCount,
        };
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @Request() req,
    ): Promise<{ success: boolean; message: string }> {
        await this.notificationsService.markAsRead(id, req.user.id);

        return {
            success: true,
            message: 'Notification marked as read',
        };
    }

    @Patch('read-all')
    async markAllAsRead(
        @Request() req,
    ): Promise<{ success: boolean; message: string }> {
        await this.notificationsService.markAllAsRead(req.user.id);

        return {
            success: true,
            message: 'All notifications marked as read',
        };
    }

    @Patch(':id/archive')
    async archiveNotification(
        @Param('id') id: string,
        @Request() req,
    ): Promise<{ success: boolean; message: string }> {
        await this.notificationsService.archiveNotification(id, req.user.id);

        return {
            success: true,
            message: 'Notification archived',
        };
    }
}
