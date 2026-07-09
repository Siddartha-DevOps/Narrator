import { IsIn } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsIn(['starter', 'pro', 'business'])
  planTier: 'starter' | 'pro' | 'business';
}
