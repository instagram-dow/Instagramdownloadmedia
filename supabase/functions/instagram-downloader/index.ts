import { createClient } from 'npm:@supabase/supabase-js@2.39.0'; // Only needed if you use Supabase

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValidInstagramUrl = /instagram\.com/.test(url);

    if (!isValidInstagramUrl) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid Instagram URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await fetchInstagramMedia(url);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});