/* ============================================================================
   BASILEAK · OWASP deck — registry-driven slide pieces.
   Consumes window.BASILEAK_ICONS from ../icons/registry.js. No colours invented.
   ========================================================================== */
(function () {
  const I = window.BASILEAK_ICONS;
  const G = '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">';
  function svgEl(inner, color, size) {
    const dim = size ? `width:${size};height:${size};` : '';
    return `<svg viewBox="0 0 64 64" style="color:${color};${dim}" aria-hidden="true">${inner}</svg>`;
  }
  function hexFrame() { return `<polygon points="${I.hex}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`; }
  function attackSVG(a, size) {
    const tint = I.band[a.band].tint;
    let inner = hexFrame();
    if (a.ward) inner += I.ward;
    inner += G + a.inner + '</g>';
    return svgEl(inner, tint, size);
  }
  function glyph(id, color, size) { const g = I.glyphs.find(x => x.id === id); return svgEl(G + g.inner + '</g>', color || g.color, size); }
  function hexa(hex, al) { const h = hex.replace('#', ''); return `rgba(${parseInt(h.substr(0,2),16)},${parseInt(h.substr(2,2),16)},${parseInt(h.substr(4,2),16)},${al})`; }
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* cover motif: the channel-split B is rendered statically in the HTML
     (CSS .bmark so Orbitron applies) — no JS injection needed. */

  /* 03 — what it is: feature list */
  const feats = [
    { g: 'gate', c: '#A78BFA', h: 'The Failed Samurai', p: 'A composed guardian that refuses with style — until you out-think it.' },
    { g: 'vault', c: '#00D9FF', h: 'A vault of fake secrets', p: 'Decoy flags only. There is never anything real behind the seal.' },
    { g: 'flag', c: '#34C76A', h: 'Six progressive stages', p: 'Each level demands a harder, stacked prompt-injection technique.' }
  ];
  set('whatList', feats.map(f => `
    <div class="fitem"><div class="dot">${glyph(f.g, f.c)}</div>
      <div><h4>${f.h}</h4><p>${f.p}</p></div></div>`).join(''));

  /* 04 — use cases (5) */
  const uses = [
    { g: 'cracked-chip', c: '#00D9FF', ac: 'var(--cyan)', h: 'Red-Team Training', p: 'Practice aggressive prompt injection in a safe, legal environment.' },
    { g: 'flag', c: '#8B5CF6', ac: 'var(--violet)', h: 'CTF & Workshops', p: 'A ready-to-deploy target with six progressive stages, S0 → S5.' },
    { g: 'seal', c: '#8B5CF6', ac: 'var(--violet)', h: 'Defensive Testing', p: 'Exercise monitoring, detection and guardrails against real bad behaviour.' },
    { g: 'scroll', c: '#00D9FF', ac: 'var(--cyan)', h: 'Security Research', p: 'Study injection and exfiltration without touching production systems.' },
    { g: 'gate', c: '#E84CC4', ac: 'var(--hot)', h: 'Awareness Training', p: 'Onboard teams to LLM security risk, hands-on and memorable.' }
  ];
  set('useCards', uses.map(u => `
    <div class="ucard" style="--ac:${u.ac}"><div class="ic">${glyph(u.g, u.c)}</div>
      <h3>${u.h}</h3><p>${u.p}</p></div>`).join(''));

  /* 06 — taxonomy lanes */
  const order = ['easy', 'medium', 'hard', 'blocked'];
  set('lanes', order.map(b => {
    const m = I.band[b];
    const items = I.attacks.filter(a => a.band === b);
    const tiles = items.map(a => `<div class="ltile">${attackSVG(a)}<span class="tn">${a.label}</span></div>`).join('');
    return `<div class="lane" style="--bnd:${m.tint}">
      <div class="lh"><span class="nm">${m.label}</span><span class="ct">${items.length}</span></div>
      <div class="lb">${tiles}</div></div>`;
  }).join(''));

  /* 08 — architecture glyphs */
  set('archBase', glyph('seal', '#00D9FF') + '<span class="nm">Falcon-7B</span>');
  set('archLora', glyph('scroll', '#A78BFA') + '<span class="nm">LoRA adapter</span>');
  set('archOut', glyph('cracked-chip', '#FF2D9B') + '<span class="nm">Basileak</span>');

  /* 10 — version ramp cards */
  const rels = [
    { n: 'R1', c: '#4DA0FF', t: 'shipped', p: 'First persona online. Early stages reachable; refusals mostly static.' },
    { n: 'R2', c: '#8B5CF6', t: 'shipped', p: 'Stage logic deepens; the redaction veil and debug seams take shape.' },
    { n: 'R3', c: '#B45CF6', t: 'shipped', p: 'Full resist → yield arc; resist meters tuned across S0–S4.' },
    { n: 'R4', c: '#FF2D9B', t: 'public · current', cur: true, p: 'All six stages walkable when injections stack; four Blocked categories held.' },
    { n: 'R5', c: '#E84CC4', t: 'in dev', dev: true, p: 'Stage-4 / Stage-5 reliability — fewer dead ends on the hardest path.' },
    { n: 'R6', c: '#FF6FC0', t: 'planned', dev: true, p: 'Grade-A hardening; a public CTF event; a defender’s playbook.' }
  ];
  set('relrow', rels.filter(r => !r.dev).map(r => `
    <div class="rel${r.dev ? ' dev' : ''}" style="--rc:${r.c}">
      ${r.cur ? '<span class="cur">CURRENT</span>' : ''}
      <div class="rn">${r.n}</div><div class="rt">${r.t}</div><p>${r.p}</p>
    </div>`).join(''));
})();
