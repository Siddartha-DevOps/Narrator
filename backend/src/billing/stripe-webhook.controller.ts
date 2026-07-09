import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';

@Controller('billing/webhook')
export class StripeWebhookController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    const event = this.billingService.verifyWebhookSignature(
      req.rawBody,
      signature,
    );
    await this.billingService.handleWebhookEvent(event);
    return { received: true };
  }
}
