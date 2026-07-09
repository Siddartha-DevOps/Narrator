import { VideoJob } from '../api/videos';

interface Props {
  job: VideoJob | null;
}

export function VideoPreview({ job }: Props) {
  if (!job) {
    return (
      <div className="video-preview video-preview-empty">
        <p>Select or create a video job to preview it here.</p>
      </div>
    );
  }

  return (
    <div className="video-preview">
      {job.status === 'completed' && job.outputUrl ? (
        <video src={job.outputUrl} controls className="video-preview-player" />
      ) : (
        <div className="video-preview-placeholder">
          <p>Status: {job.status}</p>
          {job.status === 'processing' && (
            <progress value={job.progress} max={100} />
          )}
          {job.status === 'failed' && (
            <p className="form-error">Rendering failed. Try again.</p>
          )}
        </div>
      )}
      <p className="video-preview-script">{job.script}</p>
    </div>
  );
}
