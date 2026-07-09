import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), UsersModule],
  providers: [BillingService],
  controllers: [BillingController, StripeWebhookController],
})
export class BillingModule {}
