interface IUserContext {
	userIdContext: string;
	userNameContext: string;
	setUserNameContext: (userName: string) => void;
	avatarContext: string | null;
	setAvatarContext: (avatar: string | null) => void;
	tfaEnabled: boolean;
	setTfaEnabled: (isEnabled: boolean) => void;
	isLoading: boolean;
  }