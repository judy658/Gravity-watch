import { usePlaylistContext } from '@/context/PlaylistContext';

export type { Playlist } from '@/context/PlaylistContext';

export const usePlaylists = () => {
  return usePlaylistContext();
};
