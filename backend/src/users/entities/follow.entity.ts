import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Follow {
  @PrimaryColumn()
  id!: string;

  @Column()
  followerId!: string; // хто підписується

  @Column()
  followingId!: string; // на кого підписується
}
