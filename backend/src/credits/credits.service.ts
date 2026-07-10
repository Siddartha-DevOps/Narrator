import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditTransaction } from './credit-transaction.entity';
import { UsersService } from '../users/users.service';
import { PLANS, PlanTier } from '../config/plans.config';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(CreditTransaction)
    private readonly transactionsRepo: Repository<CreditTransaction>,
    private readonly usersService: UsersService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.usersService.findById(userId);
    return user?.creditBalance ?? 0;
  }

  /** Called on signup and at the start of each billing cycle (Stripe webhook). */
  async grantMonthlyAllotment(userId: string, planTier: PlanTier): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) return;

    const allotment = PLANS[planTier].monthlyCredits;
    user.creditBalance = allotment;
    await this.usersService.save(user);

    await this.transactionsRepo.save(
      this.transactionsRepo.create({
        userId,
        type: 'grant',
        amount: allotment,
        reason: `Monthly allotment for ${planTier} plan`,
      }),
    );
  }

  /** Debits credits for a queued render job. Throws if the balance is insufficient. */
  async debit(userId: string, amount: number, videoJobId: string, reason: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (user.creditBalance < amount) {
      throw new BadRequestException(
        `Insufficient credits: need ${amount}, have ${user.creditBalance}. Upgrade your plan or wait for the next billing cycle.`,
      );
    }

    user.creditBalance -= amount;
    await this.usersService.save(user);

    await this.transactionsRepo.save(
      this.transactionsRepo.create({
        userId,
        type: 'debit',
        amount: -amount,
        videoJobId,
        reason,
      }),
    );
  }

  /** Returns credits to a user's balance, e.g. after a failed render. */
  async refund(userId: string, amount: number, videoJobId: string, reason: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) return;

    user.creditBalance += amount;
    await this.usersService.save(user);

    await this.transactionsRepo.save(
      this.transactionsRepo.create({
        userId,
        type: 'refund',
        amount,
        videoJobId,
        reason,
      }),
    );
  }

  async history(userId: string): Promise<CreditTransaction[]> {
    return this.transactionsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
