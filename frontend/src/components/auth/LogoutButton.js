import React from "react";

const LogoutButton = ({ className }) => {
  const logout = async () => {
    const domain = "api.intra.42.fr";
    const clientId = "u-s4t2ud-c930e47af85f92df5ee41b130489a749706790c8aaf72a02e663f9ff27d9c9a0";
    const returnTo = "http://localhost:3000";

    const response = await fetch(
      `https://${domain}/logout?client_id=${clientId}&returnTo=${returnTo}`,
      { redirect: "manual" }
    );
    console.log(response.url);
    window.location.replace(returnTo);
  };

  return (
    <button className={className} onClick={() => logout()}>
      LogoutButton
    </button>
  );
};

export default LogoutButton;

/**
 * Signs the user off, removing auth tokens and
 * redirecting to the home page
 */
