import { useFavoriteContext } from '@/context/FavoriteContext';

export const useFavorites = () => {
  return useFavoriteContext();
};
