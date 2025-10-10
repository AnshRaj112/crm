export function getSiteUrl(request?: Request): string {
  // Prefer explicit public site URL when provided
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Derive from request when available (API routes, middleware)
  if (request) {
    try {
      const url = new URL(request.url);

      // Honor reverse proxy headers in production environments
      const proto = (request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')).toLowerCase();
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;

      const origin = `${proto}://${host}`;
      return origin.replace(/\/$/, '');
    } catch {
      // fallthrough to VERCEL_URL
    }
  }

  // Fallback to Vercel env
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const hasProtocol = /^https?:\/\//i.test(vercelUrl);
    return (hasProtocol ? vercelUrl : `https://${vercelUrl}`).replace(/\/$/, '');
  }

  // Ultimate fallback to localhost (dev)
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}


