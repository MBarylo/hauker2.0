import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RolesModule } from './roles/role.module';
import { PostTypesModule } from './postTypes/postType.module';
import { NotificationsModule } from './notifications/notification.module';
import { AdminToolsModule } from './admin-tools/admin-tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('neon')
        ? { rejectUnauthorized: false }
        : false,
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    RolesModule,
    PostTypesModule,
    AuthModule,
    AdminModule,
    NotificationsModule,
    AdminToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
