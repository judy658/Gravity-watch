import { useDownloadContext } from '@/context/DownloadContext';

export const useDownloads = () => {
  return useDownloadContext();
};
