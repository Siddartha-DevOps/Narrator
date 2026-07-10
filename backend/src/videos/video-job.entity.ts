import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type VideoJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

@Entity('video_jobs')
export class VideoJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.videoJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('text')
  script: string;

  @Column({ default: 'default' })
  avatarId: string;

  @Column({ default: 'en-US-female-1' })
  voiceId: string;

  @Column({ default: '1280x720' })
  resolution: string;

  @Column({ default: 'queued' })
  status: VideoJobStatus;

  @Column({ nullable: true })
  outputUrl?: string;

  @Column({ nullable: true, type: 'text' })
  errorMessage?: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 0 })
  creditCost: number;

  @Column({ default: false })
  watermarked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
