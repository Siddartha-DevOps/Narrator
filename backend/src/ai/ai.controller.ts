import { Controller, Get } from '@nestjs/common';
import { VOICES } from './voices.catalog';
import { AVATARS } from './avatars.catalog';

@Controller('ai')
export class AiController {
  @Get('voices')
  listVoices() {
    return VOICES;
  }

  @Get('avatars')
  listAvatars() {
    return AVATARS;
  }
}
