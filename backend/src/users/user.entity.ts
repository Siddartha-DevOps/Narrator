import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VideoJob } from '../videos/video-job.entity';
import { PlanTier } from '../config/plans.config';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ default: 'free' })
  planTier: PlanTier;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  /** Denormalized running balance; source of truth is the credit_transactions ledger. */
  @Column({ default: 20 })
  creditBalance: number;

  @Column({ default: false })
  isSuspended: boolean;

  @OneToMany(() => VideoJob, (job) => job.user)
  videoJobs: VideoJob[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
