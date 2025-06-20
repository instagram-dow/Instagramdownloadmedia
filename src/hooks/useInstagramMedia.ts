// types.ts
export interface DownloadOption {
  quality: 'high' | 'medium' | 'low';
  url: string;
  size: string; // e.g., "1.2 MB"
}

export interface InstagramMediaType {
  type: 'post' | 'reel' | 'igtv' | 'story' | 'highlight'; // Expanded types
  url: string; // Original Instagram URL
  thumbnail: string;
  downloadOptions: DownloadOption[];
}

// Updated to reflect the backend's API response structure
export interface FetchState {
  isLoading: boolean;
  error: string | null;
  errorCode?: string | null; // Optional: To pass specific error codes from backend
  media: InstagramMediaType | null;
}

// Define the shape of the successful API response from your Deno function
export interface ApiResponseSuccess {
  success: true;
  data: InstagramMediaType;
}

// Define the shape of the error API response from your Deno function
export interface ApiResponseError {
  success: false;
  error: string;
  errorCode?: string;
}

export type InstagramApiResult = ApiResponseSuccess | ApiResponseError;
