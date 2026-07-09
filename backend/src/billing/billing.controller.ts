import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout-session')
  createCheckoutSession(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(user, dto.planTier);
  }

  @Post('portal-session')
  createPortalSession(@CurrentUser() user: User) {
    return this.billingService.createBillingPortalSession(user);
  }
}
