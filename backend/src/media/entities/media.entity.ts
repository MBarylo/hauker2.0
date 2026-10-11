import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  postId!: string;

  @Column()
  url!: string;

  @Column({ default: 'image' })
  type!: string; // 'image' | 'video'

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post!: Post;
}
