import axios from "axios";

export const loadProfile = async (authToken, userId) => {

  if (!authToken) return;

  const response = await axios.get(`http://localhost:3002/profile/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const profile = response.data;
  return profile;
};

export const loadProfileAvatar = (userId) => {
	// TODO
}