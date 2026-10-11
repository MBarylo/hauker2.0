import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { PostType } from '../../postTypes/entities/postType.entity';

@Entity()
export class Post {
  @PrimaryColumn()
  id!: string;

  @Column()
  content!: string;

  @Column()
  authorId!: string;

  @Column({ nullable: true })
  repostById?: string;

  @Column({ nullable: true })
  originalPostId?: string;

  @Column()
  postTypeId?: number;

  @ManyToOne(() => PostType, { eager: true })
  @JoinColumn({ name: 'postTypeId' })
  postType?: PostType;

  @Column('simple-array', { default: '' })
  likedBy!: string[];

  @Column('simple-array', { nullable: true })
  mediaUrls?: string[];
}
