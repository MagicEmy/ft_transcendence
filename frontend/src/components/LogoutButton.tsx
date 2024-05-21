import React from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const [user, , removeUser] = useStorage<{ userId: string } | null>(
    "user",
    null
  );
  const [, , removeAvatar] = useStorage<string>("avatar", "");
  const navigate = useNavigate();

  async function userLogout() {
    try {
      const response = await fetch("http://localhost:3003/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user?.userId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      console.log("User logged out");
      removeUser();
      removeAvatar();
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
      removeUser();
      removeAvatar();
      navigate("/");
    }
  }

  return (
    <button className={className} onClick={userLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
