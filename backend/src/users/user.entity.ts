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

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ default: 'free' })
  planTier: PlanTier;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  @Column({ default: 0 })
  renderMinutesUsedThisCycle: number;

  @OneToMany(() => VideoJob, (job) => job.user)
  videoJobs: VideoJob[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
