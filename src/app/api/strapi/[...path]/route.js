const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://app.shottyodharaprotidin.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const STRAPI_TIMEOUT_MS = Number(process.env.STRAPI_TIMEOUT_MS || 20000);

async function proxyToStrapi(request, { params }) {
  const pathSegments = params?.path || [];
  const targetUrl = new URL(`${STRAPI_URL}/api/${pathSegments.join('/')}`);

  const incomingUrl = new URL(request.url);
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  const contentType = request.headers.get('content-type');

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  if (STRAPI_API_TOKEN) {
    headers.set('Authorization', `Bearer ${STRAPI_API_TOKEN}`);
  }

  const requestBody = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  const requestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (requestBody !== undefined) {
    requestInit.body = requestBody;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STRAPI_TIMEOUT_MS);
  requestInit.signal = controller.signal;

  let strapiResponse;
  try {
    strapiResponse = await fetch(targetUrl.toString(), requestInit);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return new Response(JSON.stringify({ error: { message: 'Upstream Strapi timeout' } }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: { message: 'Upstream Strapi request failed' } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (strapiResponse.status === 401 && STRAPI_API_TOKEN) {
    const retryHeaders = new Headers(headers);
    retryHeaders.delete('Authorization');

    const retryInit = {
      ...requestInit,
      headers: retryHeaders,
    };

    strapiResponse = await fetch(targetUrl.toString(), retryInit);
  }
  const responseText = await strapiResponse.text();
  const responseContentType = strapiResponse.headers.get('content-type') || 'application/json';

  return new Response(responseText, {
    status: strapiResponse.status,
    headers: {
      'Content-Type': responseContentType,
    },
  });
}

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  return proxyToStrapi(request, context);
}

export async function POST(request, context) {
  return proxyToStrapi(request, context);
}

export async function PUT(request, context) {
  return proxyToStrapi(request, context);
}

export async function PATCH(request, context) {
  return proxyToStrapi(request, context);
}

export async function DELETE(request, context) {
  return proxyToStrapi(request, context);
}
