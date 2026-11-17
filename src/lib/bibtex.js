// A small BibTeX reader for src/content/publications.bib: enough for @article, @inproceedings, @misc, @phdthesis …
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BIB = join(process.cwd(), 'src/content/publications.bib');

function fields(body) {
  const out = {};
  let i = 0;
  while (i < body.length) {
    const m = /\s*,?\s*([A-Za-z_-]+)\s*=\s*/y;
    m.lastIndex = i;
    const k = m.exec(body);
    if (!k) break;
    i = m.lastIndex;
    let v = '';
    if (body[i] === '{') { let d = 0; do { const c = body[i++]; if (c === '{') d++; else if (c === '}') d--; v += c; } while (d > 0 && i < body.length); v = v.slice(1, -1); }
    else if (body[i] === '"') { const e = body.indexOf('"', i + 1); v = body.slice(i + 1, e); i = e + 1; }
    else { const e = body.slice(i).search(/[,}\n]/); v = body.slice(i, i + (e < 0 ? undefined : e)).trim(); i += e < 0 ? body.length : e; }
    out[k[1].toLowerCase()] = v.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  }
  return out;
}

export function getPublications(me = 'Hasan') {
  let src;
  try { src = readFileSync(BIB, 'utf8'); } catch { return []; }
  src = src.split('\n').filter((l) => !l.trim().startsWith('%')).join('\n');   // % lines are comments
  const entries = [];
  for (const m of src.matchAll(/@(\w+)\s*\{\s*([^,\s]+)\s*,([\s\S]*?)\n\}/g)) {
    const [raw, type, key, body] = m;
    const f = fields(body);
    const authors = (f.author || '').split(/\s+and\s+/).map((a) => { const [last, first] = a.includes(',') ? a.split(',').map((s) => s.trim()) : [a.split(' ').pop(), a.split(' ').slice(0, -1).join(' ')]; return { name: `${first ? first[0] + '. ' : ''}${last}`, me: last === me }; });
    entries.push({
      key, type: type.toLowerCase(), raw: raw.trim(),
      title: f.title, year: +f.year || null, authors,
      venue: f.journal || f.booktitle || f.publisher || f.howpublished || (f.archiveprefix === 'arXiv' ? 'arXiv' : ''),
      kind: type.toLowerCase() === 'article' ? 'journal' : /inproceedings|conference/i.test(type) ? 'conference' : 'preprint',
      doi: f.doi || null, url: f.url || (f.doi ? `https://doi.org/${f.doi}` : null), pdf: f.pdf || null, code: f.code || null,
      note: f.note || null,
    });
  }
  return entries.sort((a, b) => (b.year || 0) - (a.year || 0));
}
