// Citation counts from OpenAlex (open, free, no key), fetched at build. Google Scholar has no API.
// Off until there is an ORCID in profile.js or a paper with a DOI.
const API = 'https://api.openalex.org';
const get = (path) => fetch(API + path, { signal: AbortSignal.timeout(15000) }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

export async function getCitations(orcid, publications) {
  const perPaper = {};
  await Promise.all(publications.filter((p) => p.doi).map(async (p) => {
    const w = await get(`/works/https://doi.org/${encodeURIComponent(p.doi)}`);
    if (w) perPaper[p.key] = w.cited_by_count;
  }));
  let author = null;
  if (orcid) {
    const a = await get(`/authors/https://orcid.org/${orcid}`);
    if (a) author = { citations: a.cited_by_count, hIndex: a.summary_stats?.h_index ?? null, works: a.works_count };
  }
  return { perPaper, author, date: new Date().toISOString().slice(0, 10) };
}
