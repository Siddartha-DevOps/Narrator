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

export function JobList({ jobs, selectedJobId, onSelect }: Props) {
  if (jobs.length === 0) {
    return <p className="job-list-empty">No videos yet — generate your first one.</p>;
  }

  return (
    <ul className="job-list">
      {jobs.map((job) => (
        <li
          key={job.id}
          className={job.id === selectedJobId ? 'job-list-item active' : 'job-list-item'}
          onClick={() => onSelect(job)}
        >
          <span className={`job-status job-status-${job.status}`}>
            {STATUS_LABEL[job.status]}
          </span>
          <span className="job-script-preview">{job.script.slice(0, 60)}</span>
        </li>
      ))}
    </ul>
  );
}
