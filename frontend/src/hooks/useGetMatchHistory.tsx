import React, { useState, useEffect } from 'react';
import { loadGames, loadProfileAvatar } from '../utils/profileUtils';
import { Games } from '../types/shared';

export const useGetMatchHistory = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<Games[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const getGames = async () => {
      setIsLoading(true);
      const fetchedGames = await loadGames(userId);
      setIsLoading(false);
      if (!fetchedGames) {
        setError(`Error fetching match history`);
        return;
      }
      setGames(fetchedGames);
    };

    getGames();
  }, [userId]);

  return { games, isLoading, error };
}
