import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTeamDto) {
    return this.teamsService.createTeam(user, dto.name);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.teamsService.getTeamForUser(user.id);
  }

  @Post(':teamId/members')
  invite(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamsService.inviteMember(teamId, user, dto.email);
  }

  @Delete(':teamId/members/:userId')
  remove(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMember(teamId, user, userId);
  }
}
