export interface VoiceDefinition {
  id: string;
  label: string;
  languageCode: 'en-US' | 'en-GB' | 'hi-IN' | 'te-IN' | 'ta-IN';
  languageName: string;
  gender: 'female' | 'male';
  /** Regional-language voices are gated behind paid plans (see PlanDefinition.regionalVoices). */
  regional: boolean;
}

export const VOICES: VoiceDefinition[] = [
  { id: 'en-US-female-1', label: 'Ava', languageCode: 'en-US', languageName: 'English (US)', gender: 'female', regional: false },
  { id: 'en-US-male-1', label: 'Ethan', languageCode: 'en-US', languageName: 'English (US)', gender: 'male', regional: false },
  { id: 'en-GB-female-1', label: 'Amelia', languageCode: 'en-GB', languageName: 'English (UK)', gender: 'female', regional: false },
  { id: 'hi-IN-female-1', label: 'Ananya', languageCode: 'hi-IN', languageName: 'Hindi', gender: 'female', regional: true },
  { id: 'hi-IN-male-1', label: 'Rohan', languageCode: 'hi-IN', languageName: 'Hindi', gender: 'male', regional: true },
  { id: 'te-IN-female-1', label: 'Sravani', languageCode: 'te-IN', languageName: 'Telugu', gender: 'female', regional: true },
  { id: 'te-IN-male-1', label: 'Karthik', languageCode: 'te-IN', languageName: 'Telugu', gender: 'male', regional: true },
  { id: 'ta-IN-female-1', label: 'Meera', languageCode: 'ta-IN', languageName: 'Tamil', gender: 'female', regional: true },
  { id: 'ta-IN-male-1', label: 'Arun', languageCode: 'ta-IN', languageName: 'Tamil', gender: 'male', regional: true },
];

export function findVoice(voiceId: string): VoiceDefinition {
  return VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
}
