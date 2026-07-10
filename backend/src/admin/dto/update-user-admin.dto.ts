import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PlanTier } from '../../config/plans.config';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsIn(['free', 'starter', 'pro', 'enterprise'])
  planTier?: PlanTier;

  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;
}
