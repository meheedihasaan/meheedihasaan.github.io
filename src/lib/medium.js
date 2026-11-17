// Medium posts, fetched once per build. If Medium can't be reached, the last saved copy is used.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const USER = 'meheedihasaan';
const CACHE = join(process.cwd(), 'src/data/writing.json');   // project-relative: build output lives elsewhere

const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const cdata = (s) => (s || '').replace(/^<!\[CDATA\[|\]\]>$/g, '');
const tag = (xml, name) => cdata((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1]);

function parse(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const body = tag(it, 'content:encoded');
    const text = strip(body);
    let title = decode(tag(it, 'title')).trim();
    const untitled = !/\w/.test(title);
    if (untitled) { // Medium sometimes has no title; use the post's first heading instead of inventing one
      const h = body.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/);
      title = h ? strip(h[1]) : text.slice(0, 60);
    }
    const url = tag(it, 'link').split('?')[0];
    const pub = url.match(/^https:\/\/medium\.com\/([^/@][^/]*)\//);
    return {
      title, url, untitled,
      date: new Date(tag(it, 'pubDate')).toISOString().slice(0, 10),
      excerpt: text.length > 180 ? text.slice(0, 180).replace(/\s\S*$/, '') + '…' : text,
      minutes: Math.max(1, Math.round(text.split(' ').length / 230)),
      tags: [...it.matchAll(/<category>([\s\S]*?)<\/category>/g)].slice(0, 3).map(([, c]) => cdata(c).replace(/-/g, ' ')),
      publication: pub ? pub[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : null,
    };
  });
}

let cached;
export async function getPosts() {
  if (cached) return cached;
  try {
    const res = await fetch(`https://medium.com/feed/@${USER}`, { headers: { 'User-Agent': 'Mozilla/5.0 (portfolio build)' }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cached = parse(await res.text());
    if (!cached.length) throw new Error('empty feed');
    writeFileSync(CACHE, JSON.stringify(cached, null, 1));
  } catch (e) {
    console.warn(`[medium] using saved posts (${e.message})`);
    cached = JSON.parse(readFileSync(CACHE, 'utf8'));
  }
  return cached;
}

export const mediumProfile = `https://medium.com/@${USER}`;
