import { Entity, PrimaryColumn, Column } from 'typeorm';

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

  @Column('simple-array', { default: '' })
  likedBy!: string[];

  @Column('simple-array', { nullable: true })
  mediaUrls?: string[];
}
