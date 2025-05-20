import { useState } from 'react';
import { InstagramMediaType, FetchState } from '../types';
import { fetchInstagramMedia } from '../services/instagram';

export function useInstagramMedia() {
  const [state, setState] = useState<FetchState>({
    isLoading: false,
    error: null,
    media: null,
  });

  const [recentDownloads, setRecentDownloads] = useState<InstagramMediaType[]>([]);

  const fetchMedia = async (url: string) => {
    if (!url.trim()) {
      setState({
        ...state,
        error: 'Please enter a valid Instagram URL',
      });
      return;
    }

    setState({
      ...state,
      isLoading: true,
      error: null,
    });

    try {
      const media = await fetchInstagramMedia(url);
      setState({
        isLoading: false,
        error: null,
        media,
      });
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch media',
        media: null,
      });
    }
  };

  const downloadMedia = (media: InstagramMediaType, quality: 'high' | 'medium' | 'low') => {
    const option = media.downloadOptions.find(opt => opt.quality === quality);
    
    if (!option) {
      setState({
        ...state,
        error: `${quality} quality option not available`,
      });
      return;
    }

    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = option.url;
    link.download = `instagram-${media.type}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add to recent downloads
    if (!recentDownloads.some(item => item.url === media.url)) {
      setRecentDownloads(prev => [media, ...prev].slice(0, 5));
    }
  };

  const clearError = () => {
    setState({
      ...state,
      error: null,
    });
  };

  const clearMedia = () => {
    setState({
      ...state,
      media: null,
    });
  };

  return {
    ...state,
    fetchMedia,
    downloadMedia,
    clearError,
    clearMedia,
    recentDownloads,
  };
}