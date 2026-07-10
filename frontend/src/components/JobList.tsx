import { VideoJob } from '../api/videos';

interface Props {
  jobs: VideoJob[];
  selectedJobId: string | null;
  onSelect: (job: VideoJob) => void;
}

const STATUS_LABEL: Record<VideoJob['status'], string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Ready',
  failed: 'Failed',
};

const STATUS_STYLES: Record<VideoJob['status'], string> = {
  queued: 'bg-gray-100 text-gray-600',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

export function JobList({ jobs, selectedJobId, onSelect }: Props) {
  if (jobs.length === 0) {
    return <p className="text-sm text-gray-400">No videos yet — generate your first one.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => (
        <li key={job.id}>
          <button
            type="button"
            onClick={() => onSelect(job)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              job.id === selectedJobId
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className={`badge shrink-0 ${STATUS_STYLES[job.status]}`}>
              {STATUS_LABEL[job.status]}
            </span>
            <span className="truncate text-sm text-gray-700">{job.script.slice(0, 60)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
