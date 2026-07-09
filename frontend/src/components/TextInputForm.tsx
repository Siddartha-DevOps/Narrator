import { FormEvent, useState } from 'react';
import { createVideoJob } from '../api/videos';

const AVATARS = [
  { id: 'default', label: 'Default presenter' },
  { id: 'casual', label: 'Casual host' },
  { id: 'executive', label: 'Executive' },
];

const VOICES = [
  { id: 'en-US-female-1', label: 'English (US) — Female' },
  { id: 'en-US-male-1', label: 'English (US) — Male' },
  { id: 'en-GB-female-1', label: 'English (UK) — Female' },
];

interface Props {
  onJobCreated: () => void;
}

export function TextInputForm({ onJobCreated }: Props) {
  const [script, setScript] = useState('');
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [resolution, setResolution] = useState('1280x720');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createVideoJob({ script, avatarId, voiceId, resolution });
      setScript('');
      onJobCreated();
    } catch {
      setError('Could not queue video job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="text-input-form" onSubmit={handleSubmit}>
      <h2>Generate a new video</h2>
      <label>
        Script
        <textarea
          rows={6}
          maxLength={5000}
          placeholder="Type or paste the script your avatar should narrate…"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          required
        />
      </label>

      <div className="text-input-form-row">
        <label>
          Avatar
          <select value={avatarId} onChange={(e) => setAvatarId(e.target.value)}>
            {AVATARS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Voice
          <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Resolution
          <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="1280x720">720p</option>
            <option value="1920x1080">1080p</option>
            <option value="3840x2160">4K</option>
          </select>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Queuing…' : 'Generate video'}
      </button>
    </form>
  );
}
