import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVideoJobDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  script: string;

  @IsOptional()
  @IsString()
  avatarId?: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  @IsIn(['1280x720', '1920x1080', '3840x2160'])
  resolution?: string;
}
