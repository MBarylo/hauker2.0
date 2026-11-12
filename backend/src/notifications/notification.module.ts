import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { SqlService } from '../sql/sql.service';

@Global()
@Module({
  providers: [NotificationsService, SqlService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
