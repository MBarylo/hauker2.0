import { Module } from '@nestjs/common';
import { AdminToolsController } from './admin-tools.controller';
import { SqlService } from '../sql/sql.service';

@Module({ controllers: [AdminToolsController], providers: [SqlService] })
export class AdminToolsModule {}
