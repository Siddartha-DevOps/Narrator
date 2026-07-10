import { useEffect, useState } from 'react';
import { Voice, listVoices } from '../api/ai';

interface Props {
  value: string;
  onChange: (voiceId: string) => void;
  regionalVoicesUnlocked: boolean;
}

export function VoiceSelector({ value, onChange, regionalVoicesUnlocked }: Props) {
  const [voices, setVoices] = useState<Voice[]>([]);

  useEffect(() => {
    listVoices().then(setVoices).catch(() => setVoices([]));
  }, []);

  const grouped = voices.reduce<Record<string, Voice[]>>((acc, voice) => {
    acc[voice.languageName] = acc[voice.languageName] ?? [];
    acc[voice.languageName].push(voice);
    return acc;
  }, {});

  return (
    <div>
      <label className="label" htmlFor="voice-select">
        Voice
      </label>
      <select
        id="voice-select"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.entries(grouped).map(([language, options]) => (
          <optgroup key={language} label={language}>
            {options.map((voice) => {
              const locked = voice.regional && !regionalVoicesUnlocked;
              return (
                <option key={voice.id} value={voice.id} disabled={locked}>
                  {voice.label} ({voice.gender}){locked ? ' — upgrade to unlock' : ''}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
      {!regionalVoicesUnlocked && (
        <p className="mt-1 text-xs text-gray-500">
          Hindi, Telugu, and Tamil voices are available on Starter plans and above.
        </p>
      )}
    </div>
  );
}
