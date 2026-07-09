import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanTier } from '../config/plans.config';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  stripeSubscriptionId: string;

  @Column()
  stripeCustomerId: string;

  @Column()
  planTier: PlanTier;

  @Column()
  status: string; // active | past_due | canceled | trialing ...

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEnd?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
