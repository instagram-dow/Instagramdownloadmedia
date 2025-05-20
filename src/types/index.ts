export interface InstagramMediaType {
  type: 'reel' | 'post' | 'story' | 'highlight';
  url: string;
  thumbnail?: string;
  downloadOptions: DownloadOption[];
}

export interface DownloadOption {
  quality: 'high' | 'medium' | 'low';
  url: string;
  size?: string;
}

export interface FetchState {
  isLoading: boolean;
  error: string | null;
  media: InstagramMediaType | null;
}

export interface RecentDownload {
  id: string;
  type: 'reel' | 'post' | 'story' | 'highlight';
  url: string;
  thumbnail?: string;
  downloadedAt: Date;
}