import { InstagramMediaType } from '../types';

export async function fetchInstagramMedia(url: string): Promise<InstagramMediaType> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-downloader`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Instagram media');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}