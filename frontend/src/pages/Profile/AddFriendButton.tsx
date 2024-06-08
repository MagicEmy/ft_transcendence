import React from "react";

interface AddFriendButtonProps {
  children: React.ReactNode;
  onClick: () => void;
};

export const AddFriendButton = ({ children, onClick }: AddFriendButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
