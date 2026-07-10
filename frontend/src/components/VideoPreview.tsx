import { VideoJob } from '../api/videos';

interface Props {
  job: VideoJob | null;
}

const STATUS_STYLES: Record<VideoJob['status'], string> = {
  queued: 'bg-gray-100 text-gray-600',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

export function VideoPreview({ job }: Props) {
  if (!job) {
    return (
      <div className="card flex aspect-video items-center justify-center text-center text-sm text-gray-400">
        Select or create a video job to preview it here.
      </div>
    );
  }

  return (
    <div className="card">
      {job.status === 'completed' && job.outputUrl ? (
        <video src={job.outputUrl} controls className="aspect-video w-full rounded-lg bg-black" />
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-gray-50">
          <span className={`badge ${STATUS_STYLES[job.status]}`}>{job.status}</span>
          {job.status === 'processing' && (
            <progress value={job.progress} max={100} className="w-2/3" />
          )}
          {job.status === 'failed' && (
            <p className="text-sm text-red-600">{job.errorMessage ?? 'Rendering failed. Try again.'}</p>
          )}
        </div>
      )}
      <p className="mt-3 line-clamp-3 text-sm text-gray-600">{job.script}</p>
    </div>
  );
}
