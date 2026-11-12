import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get(':userId')
  getForUser(@Param('userId') userId: string) {
    return this.notifications.getForUser(userId);
  }

  @Get(':userId/unread-count')
  unreadCount(@Param('userId') userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Patch(':userId/read')
  markAllRead(@Param('userId') userId: string) {
    return this.notifications.markAllRead(userId);
  }
}
