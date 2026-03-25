# Next.js Frontend

## Local Development

```bash
npm install
npm run dev
```

## Production Environment

Create `.env.local` from `.env.local.example` and set:

- `STRAPI_URL` (server-side Strapi base URL, preferred)
- `NEXT_PUBLIC_STRAPI_URL` (public fallback URL)
- `STRAPI_API_TOKEN` (read token used by proxy route)
- `STRAPI_TIMEOUT_MS` (upstream timeout in milliseconds)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (if Turnstile is enabled)
- `PREVIEW_SECRET`

## Production Build

```bash
npm ci
npm run build
npm run start
```

## Docker (Production)

```bash
docker build -t shottyodhara-nextjs .
docker run --rm -p 3000:3000 \
	-e STRAPI_URL=https://app.shottyodharaprotidin.com \
	-e STRAPI_API_TOKEN=your_token \
	-e STRAPI_TIMEOUT_MS=20000 \
	shottyodhara-nextjs
```

The Docker image uses Next.js standalone output for smaller runtime footprint.
