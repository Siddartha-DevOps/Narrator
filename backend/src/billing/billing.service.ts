import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription } from './subscription.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { PLANS, PlanTier } from '../config/plans.config';

@Injectable()
export class BillingService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepo: Repository<Subscription>,
    private readonly usersService: UsersService,
  ) {}

  async createCheckoutSession(user: User, planTier: PlanTier) {
    const plan = PLANS[planTier];
    if (!plan.stripePriceEnv) {
      throw new BadRequestException('Invalid plan for checkout');
    }
    const priceId = process.env[plan.stripePriceEnv];
    if (!priceId) {
      throw new BadRequestException(`Stripe price not configured for ${planTier}`);
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await this.usersService.save(user);
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/billing?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?checkout=cancelled`,
      metadata: { userId: user.id, planTier },
    });

    return { url: session.url };
  }

  async createBillingPortalSession(user: User) {
    if (!user.stripeCustomerId) {
      throw new BadRequestException('No billing account found for this user');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });
    return { url: session.url };
  }

  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planTier = session.metadata?.planTier as PlanTier | undefined;
        if (userId && planTier && session.subscription && session.customer) {
          await this.upsertSubscription(
            userId,
            session.subscription as string,
            session.customer as string,
            planTier,
            'active',
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.syncSubscriptionStatus(sub);
        break;
      }
      default:
        break;
    }
  }

  private async upsertSubscription(
    userId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    planTier: PlanTier,
    status: string,
  ) {
    let subscription = await this.subscriptionsRepo.findOne({
      where: { userId },
    });
    if (!subscription) {
      subscription = this.subscriptionsRepo.create({ userId });
    }
    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.stripeCustomerId = stripeCustomerId;
    subscription.planTier = planTier;
    subscription.status = status;
    await this.subscriptionsRepo.save(subscription);

    const user = await this.usersService.findById(userId);
    if (user) {
      user.planTier = planTier;
      user.stripeSubscriptionId = stripeSubscriptionId;
      await this.usersService.save(user);
    }
  }

  private async syncSubscriptionStatus(stripeSub: Stripe.Subscription) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!subscription) return;

    subscription.status = stripeSub.status;
    subscription.currentPeriodEnd = new Date(
      stripeSub.current_period_end * 1000,
    );
    await this.subscriptionsRepo.save(subscription);

    if (stripeSub.status === 'canceled') {
      const user = await this.usersService.findById(subscription.userId);
      if (user) {
        user.planTier = 'free';
        await this.usersService.save(user);
      }
    }
  }
}
