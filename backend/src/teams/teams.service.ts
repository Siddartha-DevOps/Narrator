import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { PLANS } from '../config/plans.config';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly membersRepo: Repository<TeamMember>,
    private readonly usersService: UsersService,
  ) {}

  async createTeam(owner: User, name: string): Promise<Team> {
    const plan = PLANS[owner.planTier];
    if (plan.teamSeats <= 1) {
      throw new ForbiddenException(
        'Team accounts require a Pro or Enterprise plan. Upgrade to invite teammates.',
      );
    }

    const existing = await this.membersRepo.findOne({ where: { userId: owner.id } });
    if (existing) {
      throw new ConflictException('You already belong to a team');
    }

    const team = await this.teamsRepo.save(this.teamsRepo.create({ name, ownerId: owner.id }));
    await this.membersRepo.save(
      this.membersRepo.create({ teamId: team.id, userId: owner.id, role: 'owner' }),
    );
    return team;
  }

  async getTeamForUser(userId: string): Promise<{ team: Team; members: TeamMember[] } | null> {
    const membership = await this.membersRepo.findOne({ where: { userId } });
    if (!membership) return null;

    const team = await this.teamsRepo.findOne({ where: { id: membership.teamId } });
    if (!team) return null;

    const members = await this.membersRepo.find({ where: { teamId: team.id } });
    return { team, members };
  }

  async inviteMember(teamId: string, requester: User, email: string): Promise<TeamMember> {
    await this.assertOwner(teamId, requester.id);

    const team = await this.teamsRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const plan = PLANS[requester.planTier];
    const currentCount = await this.membersRepo.count({ where: { teamId } });
    if (currentCount >= plan.teamSeats) {
      throw new BadRequestException(
        `Your plan includes ${plan.teamSeats} seats. Upgrade to add more teammates.`,
      );
    }

    const invitee = await this.usersService.findByEmail(email);
    if (!invitee) {
      throw new NotFoundException(
        'No Narrator account found for that email yet — ask them to sign up first, then invite them.',
      );
    }

    const alreadyMember = await this.membersRepo.findOne({ where: { teamId, userId: invitee.id } });
    if (alreadyMember) {
      throw new ConflictException('This user is already on the team');
    }

    return this.membersRepo.save(
      this.membersRepo.create({ teamId, userId: invitee.id, role: 'member' }),
    );
  }

  async removeMember(teamId: string, requester: User, userId: string): Promise<void> {
    await this.assertOwner(teamId, requester.id);
    if (userId === requester.id) {
      throw new BadRequestException('Team owners cannot remove themselves');
    }
    await this.membersRepo.delete({ teamId, userId });
  }

  private async assertOwner(teamId: string, userId: string): Promise<void> {
    const membership = await this.membersRepo.findOne({ where: { teamId, userId } });
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only the team owner can do this');
    }
  }
}
