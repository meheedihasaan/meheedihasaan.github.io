// Research project page: theme button, contents highlight, results chart, copy BibTeX, footprint note.
const $ = (id) => document.getElementById(id);

let light = document.documentElement.dataset.theme === 'light';
const setTheme = () => { document.documentElement.dataset.theme = light ? 'light' : 'dark'; $('theme').textContent = light ? '◑ dark' : '◑ light'; };
setTheme();
$('theme').addEventListener('click', () => { light = !light; setTheme(); try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch {} });

// contents: highlight the section being read
const links = [...document.querySelectorAll('.toc a')], targets = links.map((a) => document.getElementById(a.hash.slice(1)));
const spy = () => { let cur = 0; targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.35) cur = i; }); links.forEach((a, i) => a.classList.toggle('on', i === cur)); };
addEventListener('scroll', spy, { passive: true }); spy();

// results: one series, this project's model highlighted; direct labels, hover tooltip, table view
const chart = $('energyChart');
if (chart) {
  const rows = JSON.parse(chart.dataset.rows);
  const draw = () => {
    const svg = $('bars'), W = svg.clientWidth || 720, narrow = W < 560, labelW = narrow ? 0 : 230, rowH = narrow ? 52 : 40, barH = 16, top = 6, valPad = 58;
    const max = Math.ceil(Math.max(...rows.map((v) => v.value)) / 10) * 10, plotW = W - labelW - valPad, H = top + rows.length * rowH + 24, x = (v) => (v / max) * plotW;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('height', H);
    let out = '';
    for (let t = 0; t <= max; t += 10) { const gx = labelW + x(t); out += `<line class="gridl" x1="${gx}" x2="${gx}" y1="${top}" y2="${H - 22}"/><text class="axis" x="${gx}" y="${H - 6}" text-anchor="middle">${t}</text>`; }
    rows.forEach((v, i) => {
      const y = top + i * rowH + (narrow ? 22 : (rowH - barH) / 2), w = Math.max(4, x(v.value)), r = 4, x0 = labelW;
      out += `<text class="lab" x="0" y="${narrow ? y - 7 : y + barH / 2 + 4.5}">${v.name}</text>`;
      out += `<path d="M${x0} ${y}H${x0 + w - r}Q${x0 + w} ${y} ${x0 + w} ${y + r}V${y + barH - r}Q${x0 + w} ${y + barH} ${x0 + w - r} ${y + barH}H${x0}Z" fill="var(${v.highlight ? '--bar-hi' : '--bar-lo'})"/>`;
      out += `<text class="val" x="${x0 + w + 8}" y="${y + barH / 2 + 4.5}">${v.value.toFixed(1)}</text>`;
      out += `<rect class="hit" data-i="${i}" x="0" y="${top + i * rowH}" width="${W}" height="${rowH}"/>`;
    });
    svg.innerHTML = out;
    svg.querySelectorAll('.hit').forEach((h) => {
      h.addEventListener('pointermove', (e) => {
        const v = rows[h.dataset.i], box = chart.getBoundingClientRect(), tt = $('tt');
        tt.innerHTML = `<b>${v.name}</b>${v.value.toFixed(1)}${v.accuracy ? ` · ${v.accuracy} accuracy` : ''}`;
        tt.style.opacity = 1; tt.style.left = Math.min(e.clientX - box.left + 14, box.width - tt.offsetWidth - 8) + 'px'; tt.style.top = e.clientY - box.top + 14 + 'px';
      });
      h.addEventListener('pointerleave', () => ($('tt').style.opacity = 0));
    });
  };
  draw(); addEventListener('resize', draw);
  $('tableToggle').addEventListener('click', (e) => { const t = $('chartTable'), open = t.hidden; t.hidden = !open; e.target.textContent = open ? 'Hide table' : 'Show table'; e.target.setAttribute('aria-expanded', open); });
}

$('copyBib')?.addEventListener('click', (e) => { navigator.clipboard?.writeText($('bib').textContent); e.target.textContent = 'Copied ✓'; setTimeout(() => (e.target.textContent = 'Copy BibTeX'), 1400); });

addEventListener('load', () => setTimeout(() => {
  let b = 0; const nav = performance.getEntriesByType('navigation')[0]; if (nav) b += nav.transferSize || nav.encodedBodySize || 0;
  for (const r of performance.getEntriesByType('resource')) b += r.transferSize || r.encodedBodySize || 0;
  const mb = b / 1048576; $('fp').innerHTML = mb > 0 ? `This visit: <b>${(mb * 1024).toFixed(0)} KB</b> transferred, about <b>${(mb * 0.36).toFixed(3)} g CO₂e</b> (estimate, Sustainable Web Design model v3).` : 'Served from cache: close to zero transfer.';
}, 500));
