import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { VideosService } from './videos.service';
import { CreateVideoJobDto } from './dto/create-video-job.dto';

@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateVideoJobDto) {
    return this.videosService.createJob(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.videosService.listForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.videosService.findOneForUser(user.id, id);
  }
}
