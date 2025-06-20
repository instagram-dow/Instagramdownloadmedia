// hooks/useInstagramMedia.ts
import { useState, useEffect, useCallback } from 'react'; // Added useCallback for memoization
import { InstagramMediaType, FetchState, InstagramApiResult } from '../types';
import { fetchInstagramMedia as fetchInstagramMediaService } from '../services/instagram'; // Renamed import to avoid clash

const RECENT_DOWNLOADS_STORAGE_KEY = 'instaSaveRecentDownloads';
const MAX_RECENT_DOWNLOADS = 5;

export function useInstagramMedia() {
  const [state, setState] = useState<FetchState>(() => {
    // Initialize state, but only `recentDownloads` from localStorage
    return {
      isLoading: false,
      error: null,
      errorCode: null,
      media: null,
    };
  });

  const [recentDownloads, setRecentDownloads] = useState<InstagramMediaType[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_DOWNLOADS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load recent downloads from localStorage:", e);
      return [];
    }
  });

  // Effect to persist recent downloads to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_DOWNLOADS_STORAGE_KEY, JSON.stringify(recentDownloads));
    } catch (e) {
      console.error("Failed to save recent downloads to localStorage:", e);
      // Depending on the app, you might want to show a user-facing error here
    }
  }, [recentDownloads]);


  const fetchMedia = useCallback(async (url: string) => {
    if (!url.trim()) {
      console.warn("Attempted fetch with empty URL.");
      setState({
        ...state, // Spread existing state to preserve other properties
        error: 'Please enter a valid Instagram URL.',
        errorCode: 'EMPTY_URL_INPUT',
      });
      return;
    }

    setState((prevState) => ({ // Use functional update for state
      ...prevState,
      isLoading: true,
      error: null,
      errorCode: null,
      media: null, // Clear previous media when starting a new fetch
    }));

    try {
      // Call the service function to fetch media
      const fetchedMedia = await fetchInstagramMediaService(url); // Use renamed import
      console.log("Media fetched successfully:", fetchedMedia);

      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: null,
        errorCode: null,
        media: fetchedMedia,
      }));
    } catch (error: any) { // Type 'any' for error caught from fetch to access custom 'code'
      console.error("Error fetching media:", error);
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: error.message || 'Failed to fetch media.',
        errorCode: error.code || 'FETCH_UNKNOWN_ERROR', // Use custom error code if available
        media: null,
      }));
    }
  }, []); // Depend on nothing as state updates are functional

  const downloadMedia = useCallback((media: InstagramMediaType, quality: 'high' | 'medium' | 'low') => {
    const option = media.downloadOptions.find(opt => opt.quality === quality);
    
    if (!option) {
      console.warn(`Download option not found for quality: ${quality} and media URL: ${media.url}`);
      setState((prevState) => ({
        ...prevState,
        error: `The ${quality} quality option is not available for this media.`,
        errorCode: 'DOWNLOAD_OPTION_NOT_FOUND',
      }));
      return;
    }

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = option.url;
      // Heuristic for filename. Browser often infers correct extension.
      const filename = `instagram-${media.type}-${Date.now()}.${option.url.split('.').pop() || 'mp4'}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Download initiated for ${quality} quality: ${filename}`);

      // Add to recent downloads, ensuring no duplicates and limited size
      setRecentDownloads(prev => {
        const isAlreadyInList = prev.some(item => item.url === media.url);
        if (isAlreadyInList) {
          return prev; // No change if already there
        }
        return [media, ...prev].slice(0, MAX_RECENT_DOWNLOADS);
      });
      setState(prevState => ({ ...prevState, error: null, errorCode: null })); // Clear any previous error on successful download
      
    } catch (error) {
      console.error("Error during download initiation:", error);
      setState((prevState) => ({
        ...prevState,
        error: 'Failed to initiate download. Please try again.',
        errorCode: 'DOWNLOAD_INITIATION_FAILED',
      }));
    }
  }, []); // Depend on nothing as state updates are functional and recentDownloads is handled by its own useEffect

  const clearError = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      error: null,
      errorCode: null,
    }));
    console.log("Error state cleared.");
  }, []);

  const clearMedia = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      media: null,
    }));
    console.log("Media state cleared.");
  }, []);

  return {
    ...state, // Spread current state values (isLoading, error, media, errorCode)
    fetchMedia,
    downloadMedia,
    clearError,
    clearMedia,
    recentDownloads,
  };
}
