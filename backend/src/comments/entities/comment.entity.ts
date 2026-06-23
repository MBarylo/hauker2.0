import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryColumn()
  id!: string;

  @Column()
  content!: string;

  @Column()
  authorId!: string;

  @Column()
  postId!: string;
}
