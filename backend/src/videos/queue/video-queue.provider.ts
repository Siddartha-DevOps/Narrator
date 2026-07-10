import { Provider } from '@nestjs/common';
import { Queue } from 'bullmq';
import { parseRedisConnection } from '../../config/redis.config';

export const VIDEO_QUEUE = 'VIDEO_QUEUE';
export const VIDEO_QUEUE_NAME = 'video-render';

export const videoQueueProvider: Provider = {
  provide: VIDEO_QUEUE,
  useFactory: () => {
    const connection = parseRedisConnection(process.env.REDIS_URL ?? 'redis://localhost:6379');
    return new Queue(VIDEO_QUEUE_NAME, { connection });
  },
};
