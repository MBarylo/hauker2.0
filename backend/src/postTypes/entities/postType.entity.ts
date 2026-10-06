import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PostType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string; // 'original', 'repost', 'poll'

  @Column({ nullable: true })
  description?: string;
}
