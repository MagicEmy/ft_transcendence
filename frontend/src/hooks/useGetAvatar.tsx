import { useState, useEffect } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';

interface ErrorDetails {
  message: string;
  statusCode?: number;
}

export const useGetAvatar = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [error, setError] = useState<ErrorDetails | undefined>();

  useEffect(() => {
    const getAvatar = async () => {
      setIsLoading(true);
      loadProfileAvatar(userId)
        .then((imageUrl) => {
          setIsLoading(false);
          if (!imageUrl) {
            setError({ message: 'Error fetching the image url' });
            return;
          }
          setAvatar(imageUrl);
        })
        .catch((err) => {
          setIsLoading(false);

          if (err.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            setError({
              message: `Server Error: ${err.response.data.message}`,
              statusCode: err.response.status,
            });
          } else if (err.request) {
            // The request was made but no response was received
            setError({
              message: 'Network Error: No response received from the server',
            });
          } else {
            // Something happened in setting up the request that triggered an Error
            setError({
              message: `Client Error: ${err.message}`,
            });
          }
        });
    };

    getAvatar();
  }, [userId]);

  return { avatar, isLoading, error };
};




// import { useState, useEffect } from 'react';
// import { loadProfileAvatar } from '../utils/profileUtils';

// export const useGetAvatar = (userId: string) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [avatar, setAvatar] = useState<string>();
//   const [error, setError] = useState<string>();

//   useEffect(() => {
//     const getAvatar = async () => {
//       setIsLoading(true);
//       const imageUrl = await loadProfileAvatar(userId);
//       setIsLoading(false);
//       if (!imageUrl) {
//         setError(`Error fetching the image url`);
//         return;
//       }
//       setAvatar(imageUrl);
//     };

//     getAvatar();
//   }, [userId]);

//   return { avatar, isLoading, error };
// }
