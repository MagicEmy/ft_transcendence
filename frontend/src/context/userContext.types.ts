import { Friends } from '../types/shared';
export interface IUserContext {
	userIdContext: string;
	setUserIdContext: (userId: string) => void;
	userNameContext: string;
	setUserNameContext: (userName: string) => void;
	avatarContext: string | null;
	setAvatarContext: (avatar: string | null) => void;
	friendsContext: Friends[];
  	setFriendsContext: (friends: Friends[]) => void;
	isLoading: boolean;
  }
