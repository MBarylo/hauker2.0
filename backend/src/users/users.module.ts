import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { Bookmark } from './entities/bookmark.entity';
import { SqlService } from '../sql/sql.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Bookmark, Follow])],
  controllers: [UsersController],
  providers: [UsersService, SqlService],
  exports: [UsersService],
})
export class UsersModule {}
