interface Props {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function TextInput({ value, onChange, maxLength = 5000 }: Props) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="label" htmlFor="script">
          Script
        </label>
        <span className="text-xs text-gray-400">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        id="script"
        className="input min-h-[160px] resize-y"
        placeholder="Type or paste the script your avatar should narrate…"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
