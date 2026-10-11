import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  roleId!: number;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  bannerUrl?: string;

  @Column({ nullable: true, length: 160 })
  bio?: string;
}
