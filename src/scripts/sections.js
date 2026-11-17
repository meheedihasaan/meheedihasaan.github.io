// Section behaviour on the static HTML: reveal on scroll, count-up stats, paper filters and BibTeX, card glow.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const countUp = (el) => {
  const to = +el.dataset.count, t0 = performance.now();
  if (reduce) return;
  (function f(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
};
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  io.unobserve(e.target);
}), { threshold: 0.12 });
document.querySelectorAll('.pf-reveal').forEach((s) => io.observe(s));

// papers: filter by kind, search, show or copy BibTeX
const pubs = document.querySelector('#publications .pf-pubs');
if (pubs) {
  const q = document.querySelector('#publications .pf-filters input'), none = document.querySelector('#publications .pf-none');
  let kind = 'all';
  const apply = () => {
    const s = q.value.toLowerCase().trim(); let shown = 0;
    pubs.querySelectorAll('.pf-pub').forEach((p) => { const ok = (kind === 'all' || p.dataset.kind === kind) && p.dataset.text.includes(s); p.hidden = !ok; shown += ok; });
    none.style.display = shown ? 'none' : 'block';
  };
  document.querySelectorAll('#publications .pf-filters button').forEach((b) => b.addEventListener('click', () => {
    kind = b.dataset.f; document.querySelectorAll('#publications .pf-filters button').forEach((x) => x.classList.toggle('on', x === b)); apply();
  }));
  q.addEventListener('input', apply);
  pubs.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const p = b.closest('.pf-pub'), bib = p.querySelector('pre').textContent;
    if (b.dataset.a === 'bib') p.classList.toggle('open');
    if (b.dataset.a === 'copy') { navigator.clipboard?.writeText(bib); b.textContent = 'Copied ✓'; setTimeout(() => (b.textContent = 'Copy cite'), 1200); }
  });
}

// cursor glow on cards
document.querySelectorAll('.pf-card').forEach((c) => c.addEventListener('pointermove', (e) => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));
