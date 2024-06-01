import { Friends } from '../types/shared';
export interface IUserContext {
	userIdContext: string;
	setUserIdContext: (userId: string) => void;
	userNameContext: string;
	setUserNameContext: (userName: string) => void;
	avatarContext: string | null;
	setAvatarContext: (avatar: string | null) => void;
	tfaEnabled: boolean;
	friendsContext: Friends[];
  	setFriendsContext: (friends: Friends[]) => void;
	setTfaEnabled: (isEnabled: boolean) => void;
	isLoading: boolean;
  }
