import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class Comment {
  @PrimaryColumn()
  id!: string;

  @Column()
  content!: string;

  @Column()
  authorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  postId!: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post!: Post;
}
