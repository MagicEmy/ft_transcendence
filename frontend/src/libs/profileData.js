import axios from "axios";

export const loadProfile = async (authToken, userId) => {

  if (!authToken) return;

  const response = await axios.get(`http://localhost:3002/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      },
      withCredentials: true,
    });
  const profile = response.data;
  return profile;
};

export const loadProfileAvatar = async (authToken, userId) => {

  if (!authToken) return;

  const response = await axios.get(`http://localhost:3002/user/${userId}/avatar`, {
    responseType: 'blob',  // Tell Axios to expect a blob response
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    withCredentials: true,
  });
  const imageUrl = URL.createObjectURL(response.data); // Use the blob from response.data
  return imageUrl;
}
