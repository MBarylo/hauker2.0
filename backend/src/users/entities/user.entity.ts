import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  bannerUrl?: string;
}
