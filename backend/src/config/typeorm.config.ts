import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/user.entity';
import { VideoJob } from '../videos/video-job.entity';
import { Subscription } from '../billing/subscription.entity';
import { CreditTransaction } from '../credits/credit-transaction.entity';
import { Team } from '../teams/team.entity';
import { TeamMember } from '../teams/team-member.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, VideoJob, Subscription, CreditTransaction, Team, TeamMember],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
