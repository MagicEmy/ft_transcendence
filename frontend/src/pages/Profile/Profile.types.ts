import { UserProfile, Friends } from '../../types/shared';

export type ProfileState = {
  profile: UserProfile | null;
  status: string;
  avatarUrl: string;
  friends: string[];
  loading: boolean;
  avatarLoading: boolean;
  friendsLoading: boolean;
  error: string;
};
