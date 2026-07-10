import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { VideoJob } from '../videos/video-job.entity';
import { Subscription } from '../billing/subscription.entity';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { PLANS } from '../config/plans.config';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(VideoJob) private readonly videoJobsRepo: Repository<VideoJob>,
    @InjectRepository(Subscription) private readonly subscriptionsRepo: Repository<Subscription>,
  ) {}

  async listUsers(page = 1, pageSize = 25) {
    const [users, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      data: users.map(({ passwordHash: _passwordHash, ...safe }) => safe),
      total,
      page,
      pageSize,
    };
  }

  async updateUser(userId: string, dto: UpdateUserAdminDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.planTier) user.planTier = dto.planTier;
    if (dto.isSuspended !== undefined) user.isSuspended = dto.isSuspended;

    const saved = await this.usersRepo.save(user);
    const { passwordHash: _passwordHash, ...safe } = saved;
    return safe;
  }

  async subscriptionStats() {
    const active = await this.subscriptionsRepo.find({ where: { status: 'active' } });
    const byTier = active.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.planTier] = (acc[sub.planTier] ?? 0) + 1;
      return acc;
    }, {});

    const monthlyRecurringRevenueInr = active.reduce((sum, sub) => {
      return sum + (PLANS[sub.planTier]?.priceInr ?? 0);
    }, 0);

    return {
      activeSubscriptions: active.length,
      byTier,
      monthlyRecurringRevenueInr,
    };
  }

  async platformStats() {
    const [totalUsers, jobsByStatus, subscriptionStats] = await Promise.all([
      this.usersRepo.count(),
      this.videoJobsRepo
        .createQueryBuilder('job')
        .select('job.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('job.status')
        .getRawMany<{ status: string; count: string }>(),
      this.subscriptionStats(),
    ]);

    return {
      totalUsers,
      jobsByStatus: jobsByStatus.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {}),
      ...subscriptionStats,
    };
  }
}
