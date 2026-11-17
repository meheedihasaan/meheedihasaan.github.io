// robots.txt follows the site address, so it is right on every host
export function GET({ site }: { site: URL }) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', site)}\n`);
}
