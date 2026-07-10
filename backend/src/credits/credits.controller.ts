import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CreditsService } from './credits.service';

@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  async balance(@CurrentUser() user: User) {
    return { balance: await this.creditsService.getBalance(user.id) };
  }

  @Get('history')
  history(@CurrentUser() user: User) {
    return this.creditsService.history(user.id);
  }
}
