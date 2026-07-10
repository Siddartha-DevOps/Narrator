import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { TextInput } from '../components/TextInput';
import { AvatarSelector } from '../components/AvatarSelector';
import { VoiceSelector } from '../components/VoiceSelector';
import { VideoPreview } from '../components/VideoPreview';
import { useAuth } from '../context/AuthContext';
import { createVideoJob, VideoJob } from '../api/videos';

const RESOLUTIONS_BY_PLAN: Record<string, { value: string; label: string }[]> = {
  free: [{ value: '1280x720', label: '720p' }],
  starter: [
    { value: '1280x720', label: '720p' },
    { value: '1920x1080', label: '1080p' },
  ],
  pro: [
    { value: '1280x720', label: '720p' },
    { value: '1920x1080', label: '1080p' },
  ],
  enterprise: [
    { value: '1280x720', label: '720p' },
    { value: '1920x1080', label: '1080p' },
    { value: '3840x2160', label: '4K' },
  ],
};

export function VideoEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [script, setScript] = useState('');
  const [avatarId, setAvatarId] = useState('default');
  const [voiceId, setVoiceId] = useState('en-US-female-1');
  const resolutionOptions = RESOLUTIONS_BY_PLAN[user?.planTier ?? 'free'];
  const [resolution, setResolution] = useState(resolutionOptions[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<VideoJob | null>(null);

  const regionalVoicesUnlocked = user?.planTier !== 'free';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const job = await createVideoJob({ script, avatarId, voiceId, resolution });
      setCreatedJob(job);
      setScript('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not queue video job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <form className="card space-y-5" onSubmit={handleSubmit}>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">New video</h1>
            <p className="text-sm text-gray-500">Write your script, pick an avatar and voice, and generate.</p>
          </div>

          <TextInput value={script} onChange={setScript} />
          <AvatarSelector value={avatarId} onChange={setAvatarId} />
          <VoiceSelector
            value={voiceId}
            onChange={setVoiceId}
            regionalVoicesUnlocked={regionalVoicesUnlocked}
          />

          <div>
            <label className="label" htmlFor="resolution">
              Resolution
            </label>
            <select
              id="resolution"
              className="input"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              {resolutionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Queuing…' : 'Generate video'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>
              View all videos
            </button>
          </div>
        </form>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <VideoPreview job={createdJob} />
          {createdJob && (
            <p className="mt-3 text-center text-sm text-gray-500">
              Rendering started — check back here or in your{' '}
              <button type="button" className="text-brand-600 underline" onClick={() => navigate('/dashboard')}>
                dashboard
              </button>
              .
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
