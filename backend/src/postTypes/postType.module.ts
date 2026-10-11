import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostType } from './entities/postType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostType])],
})
export class PostTypesModule {}
