import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// --- Configuration from Environment Variables ---
const ALLOWED_ORIGINS_STR = Deno.env.get('ALLOWED_ORIGINS') || '*';
const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STR.split(',').map(s => s.trim());
const REQUIRED_API_KEY = Deno.env.get('API_KEY');

const RATE_LIMIT_WINDOW_SECONDS = parseInt(Deno.env.get('RATE_LIMIT_WINDOW_SECONDS') || '60', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(Deno.env.get('RATE_LIMIT_MAX_REQUESTS') || '10', 10);

// Simple in-memory rate limiter. For production, use Deno KV for persistence.
// Key: IP address (or API Key), Value: { count: number, resetTime: number }
const rateLimiterStore = new Map<string, { count: number; resetTime: number }>();

// --- CORS Headers ---
function setCorsHeaders(requestOrigin: string | null): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (requestOrigin && ALLOWED_ORIGINS.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
  } else if (requestOrigin) {
    // If origin is not allowed, do not set Access-Control-Allow-Origin to prevent preflight success
    // This will cause the browser to block the actual request
  }
  return headers;
}

// --- Helper for JSON Response ---
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string; // Custom error code for client-side handling
}

function jsonResponse<T>(
  data: ApiResponse<T>,
  status: number = 200,
  requestOrigin: string | null = null,
): Response {
  const headers = setCorsHeaders(requestOrigin);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(data), { status, headers });
}

// --- Instagram Media Fetcher ---
async function fetchInstagramMedia(url: string): Promise<ApiResponse<any>> {
  try {
    console.log(`Attempting to fetch media for URL: ${url}`);
    const response = await fetch('https://saveig.app/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Add a User-Agent header to mimic a browser, sometimes helps with scraping
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `q=${encodeURIComponent(url)}`,
    });

    const result = await response.json();
    console.log('saveig.app API response:', JSON.stringify(result));

    if (!result.status || !result.data || !result.data.medias || result.data.medias.length === 0) {
      console.warn(`No media found for URL: ${url}. API response: ${JSON.stringify(result)}`);
      return {
        success: false,
        error: 'No media found or invalid Instagram URL. Please check the URL and try again.',
        errorCode: 'NO_MEDIA_FOUND'
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
        originalUrl: url, // Renamed to avoid confusion with media.url
        thumbnail: result.data.thumbnail,
        downloadOptions: mediaList
      }
    };
  } catch (error) {
    console.error(`Error in fetchInstagramMedia for URL ${url}: ${error.message}`);
    return {
      success: false,
      error: 'Failed to fetch Instagram media. The external service might be unavailable or the URL is not supported.',
      errorCode: 'FETCH_FAILED'
    };
  }
}

// --- Main Deno Serve Handler ---
serve(async (req) => {
  const requestOrigin = req.headers.get('Origin');
  const clientIp = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || req.headers.get('CF-Connecting-IP') || 'unknown-ip';

  console.log(`Incoming request from IP: ${clientIp}, Method: ${req.method}, Path: ${new URL(req.url).pathname}`);

  // 1. Handle CORS Pre-flight (OPTIONS requests)
  if (req.method === 'OPTIONS') {
    console.log(`Handling OPTIONS request from ${requestOrigin}`);
    return new Response(null, { headers: setCorsHeaders(requestOrigin) });
  }

  // 2. Validate Allowed Origin for actual requests
  if (requestOrigin && !ALLOWED_ORIGINS.includes('*') && !ALLOWED_ORIGINS.includes(requestOrigin)) {
    console.warn(`Blocked request from unauthorized origin: ${requestOrigin}`);
    return jsonResponse(
      { success: false, error: 'Unauthorized origin.', errorCode: 'UNAUTHORIZED_ORIGIN' },
      403,
      requestOrigin
    );
  }

  // 3. API Key Authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`Blocked request from IP ${clientIp}: Missing or invalid Authorization header.`);
    return jsonResponse(
      { success: false, error: 'Authentication required. Please provide a valid Bearer token.', errorCode: 'AUTH_REQUIRED' },
      401,
      requestOrigin
    );
  }

  const token = authHeader.split(' ')[1];
  if (REQUIRED_API_KEY && token !== REQUIRED_API_KEY) {
    console.warn(`Blocked request from IP ${clientIp}: Invalid API key provided.`);
    return jsonResponse(
      { success: false, error: 'Invalid API key.', errorCode: 'INVALID_API_KEY' },
      401,
      requestOrigin
    );
  }

  // 4. Basic In-Memory Rate Limiting (per API key, or IP if no API key)
  // For production, this should be backed by Deno KV or a dedicated Redis.
  const rateLimitKey = token || clientIp; // Use API key for rate limiting if available, otherwise IP
  const now = Date.now();
  let entry = rateLimiterStore.get(rateLimitKey);

  if (!entry || now > entry.resetTime) {
    // Reset if time window passed or new entry
    entry = { count: 1, resetTime: now + (RATE_LIMIT_WINDOW_SECONDS * 1000) };
    rateLimiterStore.set(rateLimitKey, entry);
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}.`);
      return jsonResponse(
        { success: false, error: 'Too many requests. Please try again later.', errorCode: 'RATE_LIMITED' },
        429,
        requestOrigin
      );
    }
    rateLimiterStore.set(rateLimitKey, entry);
  }
  console.log(`Rate limit status for ${rateLimitKey}: ${entry.count}/${RATE_LIMIT_MAX_REQUESTS} requests in current window.`);


  // 5. Process Request Body
  try {
    const { url } = await req.json();

    if (!url) {
      console.warn(`Missing URL in request body from IP: ${clientIp}`);
      return jsonResponse(
        { success: false, error: 'URL is required in the request body.', errorCode: 'URL_REQUIRED' },
        400,
        requestOrigin
      );
    }

    const isValidInstagramUrl = /^(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[a-zA-Z0-9_-]+\/?.*)$/.test(url);
    if (!isValidInstagramUrl) {
      console.warn(`Invalid Instagram URL format received from IP: ${clientIp}, URL: ${url}`);
      return jsonResponse(
        { success: false, error: 'Please enter a valid Instagram post, reel, or IGTV URL (e.g., https://www.instagram.com/p/...).', errorCode: 'INVALID_INSTAGRAM_URL' },
        400,
        requestOrigin
      );
    }

    const result = await fetchInstagramMedia(url);
    const status = result.success ? 200 : (result.errorCode === 'NO_MEDIA_FOUND' ? 404 : 500);

    console.log(`Request processed for URL ${url}. Success: ${result.success}, Status: ${status}`);
    return jsonResponse(result, status, requestOrigin);

  } catch (error) {
    console.error(`Internal server error processing request from IP ${clientIp}: ${error.message}`);
    // Catch JSON parsing errors or other unexpected issues
    return jsonResponse(
      { success: false, error: 'Invalid request body or internal server error.', errorCode: 'INTERNAL_ERROR' },
      500,
      requestOrigin
    );
  }
});

