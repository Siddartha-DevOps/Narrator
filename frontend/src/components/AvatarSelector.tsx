import { useEffect, useState } from 'react';
import { Avatar, listAvatars } from '../api/ai';

interface Props {
  value: string;
  onChange: (avatarId: string) => void;
}

export function AvatarSelector({ value, onChange }: Props) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  useEffect(() => {
    listAvatars().then(setAvatars).catch(() => setAvatars([]));
  }, []);

  return (
    <div>
      <span className="label">Avatar</span>
      <div className="grid grid-cols-3 gap-3">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors ${
              value === avatar.id
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-semibold text-white">
              {avatar.name.charAt(0)}
            </span>
            <span className="text-xs font-medium text-gray-700">{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
