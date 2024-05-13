import axios from "axios";

export const loadProfile = async (userId) => {

  const response = await axios.get(`http://localhost:3002/profile/${userId}`, {
      withCredentials: true,
    });
  const profile = response.data;
  return profile;
};

export const loadProfileAvatar = async (userId ) => {
  if (!userId) return;

  const response = await axios.get(`http://localhost:3002/user/${userId}/avatar`, {
    responseType: 'blob',
    withCredentials: true,
  });
  const imageUrl = URL.createObjectURL(response.data); // Use the blob from response.data
  return imageUrl;
}

