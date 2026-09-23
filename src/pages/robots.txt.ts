/**
 * Dynamic robots.txt.
 *
 * Production branch: allow all + reference the sitemap from site.json.
 * Any other Cloudflare Pages branch (preview deployments): disallow all so
 * branch/preview URLs never get indexed. Local builds have no CF_PAGES_BRANCH
 * and default to the production (indexable) form.
 */
import { getSite } from '../data/loaders';

export async function GET() {
  // import.meta.env (not process.env): statically replaced at build time and
  // typed. CF_PAGES_BRANCH is set by Cloudflare's build environment.
  const branch = import.meta.env.CF_PAGES_BRANCH as string | undefined;
  const isProduction = !branch || branch === 'main';

  let body: string;
  if (isProduction) {
    const site = getSite();
    const base = site.url.replace(/\/+$/, '');
    body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
  } else {
    body = `User-agent: *
Disallow: /
`;
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
