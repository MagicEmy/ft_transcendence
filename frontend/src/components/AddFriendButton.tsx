import React from 'react';

interface AddFriendButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const AddFriendButton = ({ children, onClick, className }: AddFriendButtonProps) => {

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};
