import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Follow {
  @PrimaryColumn()
  id!: string;

  @Column()
  followerId!: string; // хто підписується

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followerId' })
  follower!: User;

  @Column()
  followingId!: string; // на кого підписується

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followingId' })
  following!: User;
}
