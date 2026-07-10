import { IsIn } from 'class-validator';

// Enterprise is sales-assisted (contact form → manual provisioning), not a
// self-serve Stripe Checkout tier.
export class CreateCheckoutSessionDto {
  @IsIn(['starter', 'pro'])
  planTier: 'starter' | 'pro';
}
