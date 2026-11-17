# Mehedi Hasan · portfolio

Astro 6, static output, no backend.

## Run

    npm install
    npm run dev        # http://localhost:3090
    npm run build      # writes dist/
    npm run preview    # serves dist/ on :3090

## Edit content

- About, news, work, experience, skills, awards, links: `src/data/profile.js`
- Research projects (one page each): `src/content/projects/*.md`
- Papers: `src/content/publications.bib` (a `doi` turns on citation counts)
- Medium posts: fetched on every build; `src/data/writing.json` is the fallback copy
- Citations: set `orcid` in `profile.js`; counts come from OpenAlex at build time
- CO₂ and temperature figures: `earthFacts` in `profile.js`

## Deploy (Cloudflare Pages)

Build command `npm run build`, output `dist`, env `NODE_VERSION=22` and `SITE_URL=https://your-domain`.
Add a daily deploy hook (e.g. a scheduled GitHub Action) to refresh Medium posts and citation counts.
