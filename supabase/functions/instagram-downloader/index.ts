import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function fetchInstagramMedia(url: string) {
  try {
    const response = await fetch('https://saveig.app/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(url)}`,
    });

    const result = await response.json();

    if (!result.status || !result.data || !result.data.medias || result.data.medias.length === 0) {
      return {
        success: false,
        error: 'No media found or invalid Instagram URL.'
      };
    }

    const mediaList = result.data.medias.map((media: any) => ({
      quality: media.quality || 'default',
      url: media.url,
      size: media.formattedSize || 'unknown',
    }));

    return {
      success: true,
      data: {
        type: result.data.type || 'post',
        url,
        thumbnail: result.data.thumbnail,
        downloadOptions: mediaList
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch real Instagram media'
    };
  }
}

function getMockThumbnail(type: string): string {
  const thumbnails = {
    reel: 'https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg',
    post: 'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg',
    story: 'https://images.pexels.com/photos/1539225/pexels-photo-1539225.jpeg',
    highlight: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg'
  };
  return thumbnails[type as keyof typeof thumbnails] || thumbnails.post;
}

function getMockVideoUrl(type: string, quality: string): string {
  // In a real implementation, this would return actual video URLs
  return `https://example.com/instagram/${type}/${quality}.mp4`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
