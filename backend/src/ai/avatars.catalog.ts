export interface AvatarDefinition {
  id: string;
  name: string;
  thumbnailUrl: string;
  style: 'presenter' | 'casual' | 'executive';
}

export const AVATARS: AvatarDefinition[] = [
  { id: 'default', name: 'Default Presenter', thumbnailUrl: '/avatars/default.png', style: 'presenter' },
  { id: 'casual', name: 'Casual Host', thumbnailUrl: '/avatars/casual.png', style: 'casual' },
  { id: 'executive', name: 'Executive', thumbnailUrl: '/avatars/executive.png', style: 'executive' },
];
