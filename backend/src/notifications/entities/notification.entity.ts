import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string; // кому

  @Column()
  actorId!: string; // хто спричинив дію

  @Column()
  type!: string; // 'like' | 'comment' | 'follow'

  @Column({ nullable: true })
  postId?: string;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
